import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Invoice } from "../../sales/entities/invoice.entity";
import { Bill } from "../../purchases/entities/bill.entity";
import { Product } from "../../inventory/entities/product.entity";
import { StockMovement } from "../../inventory/entities/stock-movement.entity";
import { JournalLine } from "../../accounting/entities/journal-line.entity";
import { JournalEntry } from "../../accounting/entities/journal-entry.entity";
import { Account } from "../../accounting/entities/account.entity";
import { ProductsService } from "../../inventory/services/products.service";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>,
    @InjectRepository(JournalLine) private lineRepo: Repository<JournalLine>,
    @InjectRepository(JournalEntry) private entryRepo: Repository<JournalEntry>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private productsService: ProductsService,
  ) {}

  async salesReport(tenantId: string, from?: string, to?: string) {
    const invoices = await this.invoiceRepo.find({ where: { tenantId, deletedAt: IsNull() }, relations: ["customer", "items", "items.product"] });
    const filtered = invoices.filter((i) => {
      if (from && i.date < from) return false;
      if (to && i.date > to) return false;
      return true;
    });
    const totalSales = filtered.reduce((s, i) => s + i.total, 0);
    const totalPaid = filtered.reduce((s, i) => s + i.paidAmount, 0);
    return { invoices: filtered, totalSales, totalPaid, totalDue: totalSales - totalPaid, count: filtered.length };
  }

  async stockReport(tenantId: string) {
    const products = await this.productRepo.find({ where: { tenantId, deletedAt: IsNull() } });
    const rows = [];
    for (const p of products) {
      const stock = await this.productsService.getCurrentStock(tenantId, p.id);
      rows.push({ product: p, stock, value: Math.round(stock * p.costPrice) });
    }
    return rows;
  }

  async receivablesReport(tenantId: string) {
    const invoices = await this.invoiceRepo.find({ where: { tenantId, deletedAt: IsNull() }, relations: ["customer"] });
    return invoices
      .filter((i) => i.total - i.paidAmount > 0)
      .map((i) => ({
        invoiceNumber: i.invoiceNumber,
        customer: i.customer?.nameEn ?? "Walk-in",
        date: i.date,
        dueDate: i.dueDate,
        total: i.total,
        paid: i.paidAmount,
        due: i.total - i.paidAmount,
      }));
  }

  async payablesReport(tenantId: string) {
    const bills = await this.billRepo.find({ where: { tenantId, deletedAt: IsNull() }, relations: ["supplier"] });
    return bills
      .filter((b) => b.total - b.paidAmount > 0)
      .map((b) => ({
        billNumber: b.billNumber,
        supplier: b.supplier?.nameEn ?? "—",
        date: b.date,
        dueDate: b.dueDate,
        total: b.total,
        paid: b.paidAmount,
        due: b.total - b.paidAmount,
      }));
  }

  async profitLoss(tenantId: string, from?: string, to?: string) {
    const entries = await this.entryRepo.find({ where: { tenantId }, relations: ["lines", "lines.account"] });
    const filtered = entries.filter((e) => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    });
    const byType: Record<string, number> = { income: 0, expense: 0 };
    for (const e of filtered) {
      for (const l of e.lines ?? []) {
        const type = l.account?.type;
        if (type === "income") byType.income += l.credit - l.debit;
        if (type === "expense") byType.expense += l.debit - l.credit;
      }
    }
    return {
      revenue: byType.income,
      expenses: byType.expense,
      profit: byType.income - byType.expense,
      from,
      to,
    };
  }

  toCsv(rows: any[], headers: string[]): string {
    const escape = (v: any) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(headers.map((h) => escape(r[h])).join(","));
    }
    return "\uFEFF" + lines.join("\n");
  }
}
