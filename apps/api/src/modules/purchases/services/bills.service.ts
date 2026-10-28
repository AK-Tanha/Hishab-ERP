import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { Bill } from "../entities/bill.entity";
import { BillItem } from "../entities/bill-item.entity";
import { PaymentMade } from "../entities/payment-made.entity";
import { StockService } from "../../inventory/services/stock.service";
import { ProductsService } from "../../inventory/services/products.service";
import { WarehousesService } from "../../inventory/services/warehouses.service";
import { JournalService, CreateJournalEntryInput } from "../../accounting/services/journal.service";
import { AccountsService } from "../../accounting/services/accounts.service";

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(BillItem) private itemRepo: Repository<BillItem>,
    @InjectRepository(PaymentMade) private paymentRepo: Repository<PaymentMade>,
    private stockService: StockService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private journalService: JournalService,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async list(tenantId: string) {
    return this.billRepo.find({ where: { tenantId, deletedAt: IsNull() }, order: { createdAt: "DESC" }, relations: ["supplier", "items"] });
  }

  async findOne(tenantId: string, id: string) {
    const b = await this.billRepo.findOne({ where: { id, tenantId, deletedAt: IsNull() }, relations: ["supplier", "items", "items.product"] });
    if (!b) throw new NotFoundException("Bill not found");
    return b;
  }

  async create(tenantId: string, userId: string | null, input: any, warehouseId: string) {
    await this.accountsService.seedForTenant(tenantId);
    await this.warehousesService.findOne(tenantId, warehouseId);

    const items = input.items as { productId?: string; description: string; quantity: number; unitCost: number }[];
    let subtotal = 0;
    for (const it of items) subtotal += Math.round(it.quantity * it.unitCost);
    const vat = input.vat ?? 0;
    const total = subtotal + vat;
    const paidAmount = input.paidAmount ?? 0;

    const count = await this.billRepo.count({ where: { tenantId } });
    const billNumber = `BILL-${String(count + 1).padStart(6, "0")}`;

    const bill = await this.dataSource.transaction(async (manager) => {
      const b = manager.create(Bill, {
        tenantId,
        billNumber,
        supplierId: input.supplierId ?? null,
        date: input.date,
        dueDate: input.dueDate ?? null,
        status: paidAmount >= total && total > 0 ? "paid" : paidAmount > 0 ? "partial" : "posted",
        subtotal,
        vat,
        total,
        paidAmount,
        notes: input.notes ?? null,
        createdBy: userId,
      });
      const savedBill = await manager.save(b);

      for (const it of items) {
        const itemTotal = Math.round(it.quantity * it.unitCost);
        const billItem = manager.create(BillItem, {
          tenantId,
          billId: savedBill.id,
          productId: it.productId ?? null,
          description: it.description,
          quantity: String(it.quantity),
          unitCost: it.unitCost,
          total: itemTotal,
        });
        await manager.save(billItem);

        if (it.productId) {
          await this.stockService.adjust(tenantId, userId, {
            productId: it.productId,
            warehouseId,
            type: "in",
            quantity: it.quantity,
            notes: `Bill ${billNumber}`,
            referenceType: "bill",
            referenceId: savedBill.id,
          });
        }
      }

      return savedBill;
    });

    // Post journal entry
    const apAcc = await this.accountsService.findByCode(tenantId, "2110");
    const invAcc = await this.accountsService.findByCode(tenantId, "1140");
    const vatAcc = await this.accountsService.findByCode(tenantId, "2120");
    const cashAcc = await this.accountsService.findByCode(tenantId, "1110");

    const lines: { accountId: string; debit?: number; credit?: number; description?: string | null }[] = [];
    lines.push({ accountId: invAcc.id, debit: subtotal, description: "Inventory" });
    if (vat > 0) lines.push({ accountId: vatAcc.id, debit: vat, description: "VAT" });
    if (paidAmount >= total && total > 0) {
      lines.push({ accountId: cashAcc.id, credit: total, description: "Cash paid" });
    } else {
      if (paidAmount > 0) lines.push({ accountId: cashAcc.id, credit: paidAmount, description: "Cash paid" });
      if (total - paidAmount > 0) lines.push({ accountId: apAcc.id, credit: total - paidAmount, description: "Accounts payable" });
    }

    await this.journalService.create(tenantId, userId, {
      date: bill.date,
      description: `Bill ${bill.billNumber}`,
      referenceType: "bill",
      referenceId: bill.id,
      lines,
    });

    if (paidAmount > 0) {
      const payment = this.paymentRepo.create({
        tenantId,
        billId: bill.id,
        supplierId: input.supplierId ?? null,
        amount: paidAmount,
        date: input.date,
        paymentMethod: input.paymentMethod ?? "cash",
        notes: `Payment for ${bill.billNumber}`,
        createdBy: userId,
      });
      await this.paymentRepo.save(payment);
    }

    return this.findOne(tenantId, bill.id);
  }

  async recordPayment(tenantId: string, userId: string | null, billId: string, amount: number, paymentMethod: string, date: string) {
    const bill = await this.findOne(tenantId, billId);
    const payment = this.paymentRepo.create({
      tenantId,
      billId: bill.id,
      supplierId: bill.supplierId,
      amount,
      date,
      paymentMethod,
      createdBy: userId,
    });
    await this.paymentRepo.save(payment);

    bill.paidAmount += amount;
    if (bill.paidAmount >= bill.total) bill.status = "paid";
    else if (bill.paidAmount > 0) bill.status = "partial";
    await this.billRepo.save(bill);

    const cashAcc = await this.accountsService.findByCode(tenantId, "1110");
    const apAcc = await this.accountsService.findByCode(tenantId, "2110");
    await this.journalService.create(tenantId, userId, {
      date,
      description: `Payment for ${bill.billNumber}`,
      referenceType: "payment",
      referenceId: payment.id,
      lines: [
        { accountId: apAcc.id, debit: amount },
        { accountId: cashAcc.id, credit: amount },
      ],
    });

    return payment;
  }
}
