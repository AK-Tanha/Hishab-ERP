import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { Invoice } from "../entities/invoice.entity";
import { InvoiceItem } from "../entities/invoice-item.entity";
import { PaymentReceived } from "../entities/payment-received.entity";
import { StockService } from "../../inventory/services/stock.service";
import { ProductsService } from "../../inventory/services/products.service";
import { WarehousesService } from "../../inventory/services/warehouses.service";
import { JournalService, CreateJournalEntryInput } from "../../accounting/services/journal.service";
import { AccountsService } from "../../accounting/services/accounts.service";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private itemRepo: Repository<InvoiceItem>,
    @InjectRepository(PaymentReceived) private paymentRepo: Repository<PaymentReceived>,
    private stockService: StockService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private journalService: JournalService,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async list(tenantId: string) {
    return this.invoiceRepo.find({ where: { tenantId, deletedAt: IsNull() }, order: { createdAt: "DESC" }, relations: ["customer", "items"] });
  }

  async findOne(tenantId: string, id: string) {
    const inv = await this.invoiceRepo.findOne({ where: { id, tenantId, deletedAt: IsNull() }, relations: ["customer", "items", "items.product"] });
    if (!inv) throw new NotFoundException("Invoice not found");
    return inv;
  }

  async create(tenantId: string, userId: string | null, input: any, warehouseId: string) {
    await this.accountsService.seedForTenant(tenantId);
    await this.warehousesService.findOne(tenantId, warehouseId);

    const items = input.items as { productId?: string; description: string; quantity: number; unitPrice: number }[];
    let subtotal = 0;
    for (const it of items) subtotal += Math.round(it.quantity * it.unitPrice);

    const discount = input.discount ?? 0;
    const vat = input.vat ?? 0;
    const total = subtotal - discount + vat;
    const paidAmount = input.paidAmount ?? 0;

    const count = await this.invoiceRepo.count({ where: { tenantId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;

    const invoice = await this.dataSource.transaction(async (manager) => {
      const inv = manager.create(Invoice, {
        tenantId,
        invoiceNumber,
        customerId: input.customerId ?? null,
        date: input.date,
        dueDate: input.dueDate ?? null,
        status: paidAmount >= total && total > 0 ? "paid" : paidAmount > 0 ? "partial" : "posted",
        subtotal,
        discount,
        vat,
        total,
        paidAmount,
        notes: input.notes ?? null,
        createdBy: userId,
      });
      const savedInv = await manager.save(inv);

      for (const it of items) {
        const itemTotal = Math.round(it.quantity * it.unitPrice);
        const invItem = manager.create(InvoiceItem, {
          tenantId,
          invoiceId: savedInv.id,
          productId: it.productId ?? null,
          description: it.description,
          quantity: String(it.quantity),
          unitPrice: it.unitPrice,
          total: itemTotal,
        });
        await manager.save(invItem);

        if (it.productId) {
          await this.stockService.adjust(tenantId, userId, {
            productId: it.productId,
            warehouseId,
            type: "out",
            quantity: it.quantity,
            notes: `Invoice ${invoiceNumber}`,
            referenceType: "invoice",
            referenceId: savedInv.id,
          });
        }
      }

      return savedInv;
    });

    // Post journal entry
    await this.postJournal(tenantId, userId, invoice, items, warehouseId, paidAmount, total, subtotal, discount, vat);

    if (paidAmount > 0) {
      const payment = this.paymentRepo.create({
        tenantId,
        invoiceId: invoice.id,
        customerId: input.customerId ?? null,
        amount: paidAmount,
        date: input.date,
        paymentMethod: input.paymentMethod ?? "cash",
        notes: `Payment for ${invoiceNumber}`,
        createdBy: userId,
      });
      await this.paymentRepo.save(payment);
    }

    return this.findOne(tenantId, invoice.id);
  }

  private async postJournal(tenantId: string, userId: string | null, invoice: Invoice, items: any[], warehouseId: string, paidAmount: number, total: number, subtotal: number, discount: number, vat: number) {
    const cashAcc = await this.accountsService.findByCode(tenantId, "1110");
    const arAcc = await this.accountsService.findByCode(tenantId, "1130");
    const revenueAcc = await this.accountsService.findByCode(tenantId, "4100");
    const vatAcc = await this.accountsService.findByCode(tenantId, "2120");
    const cogsAcc = await this.accountsService.findByCode(tenantId, "5100");
    const invAcc = await this.accountsService.findByCode(tenantId, "1140");

    const lines: { accountId: string; debit?: number; credit?: number; description?: string | null }[] = [];

    // Revenue side
    if (paidAmount >= total && total > 0) {
      lines.push({ accountId: cashAcc.id, debit: total, description: "Cash received" });
    } else {
      if (paidAmount > 0) lines.push({ accountId: cashAcc.id, debit: paidAmount, description: "Cash received" });
      if (total - paidAmount > 0) lines.push({ accountId: arAcc.id, debit: total - paidAmount, description: "Accounts receivable" });
    }
    lines.push({ accountId: revenueAcc.id, credit: subtotal - discount, description: "Sales revenue" });
    if (vat > 0) lines.push({ accountId: vatAcc.id, credit: vat, description: "VAT payable" });

    // COGS side
    let cogs = 0;
    for (const it of items) {
      if (it.productId) {
        const p = await this.productsService.findOne(tenantId, it.productId);
        cogs += Math.round(it.quantity * p.costPrice);
      }
    }
    if (cogs > 0) {
      lines.push({ accountId: cogsAcc.id, debit: cogs, description: "Cost of goods sold" });
      lines.push({ accountId: invAcc.id, credit: cogs, description: "Inventory" });
    }

    const input: CreateJournalEntryInput = {
      date: invoice.date,
      description: `Invoice ${invoice.invoiceNumber}`,
      referenceType: "invoice",
      referenceId: invoice.id,
      lines,
    };
    await this.journalService.create(tenantId, invoice.createdBy, input);
  }

  async recordPayment(tenantId: string, userId: string | null, invoiceId: string, amount: number, paymentMethod: string, date: string) {
    const invoice = await this.findOne(tenantId, invoiceId);
    const payment = this.paymentRepo.create({
      tenantId,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount,
      date,
      paymentMethod,
      createdBy: userId,
    });
    await this.paymentRepo.save(payment);

    invoice.paidAmount += amount;
    if (invoice.paidAmount >= invoice.total) invoice.status = "paid";
    else if (invoice.paidAmount > 0) invoice.status = "partial";
    await this.invoiceRepo.save(invoice);

    const cashAcc = await this.accountsService.findByCode(tenantId, "1110");
    const arAcc = await this.accountsService.findByCode(tenantId, "1130");
    await this.journalService.create(tenantId, userId, {
      date,
      description: `Payment for ${invoice.invoiceNumber}`,
      referenceType: "payment",
      referenceId: payment.id,
      lines: [
        { accountId: cashAcc.id, debit: amount },
        { accountId: arAcc.id, credit: amount },
      ],
    });

    return payment;
  }
}
