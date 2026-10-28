import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Between } from "typeorm";
import { Invoice } from "../../sales/entities/invoice.entity";
import { Bill } from "../../purchases/entities/bill.entity";
import { Product } from "../../inventory/entities/product.entity";
import { StockMovement } from "../../inventory/entities/stock-movement.entity";
import { ProductsService } from "../../inventory/services/products.service";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>,
    private productsService: ProductsService,
  ) {}

  async get(tenantId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const invoices = await this.invoiceRepo.find({ where: { tenantId, deletedAt: IsNull() } });
    const bills = await this.billRepo.find({ where: { tenantId, deletedAt: IsNull() } });

    const todaysSales = invoices
      .filter((i) => i.date === today)
      .reduce((s, i) => s + i.total, 0);

    const receivables = invoices.reduce((s, i) => s + (i.total - i.paidAmount), 0);
    const payables = bills.reduce((s, b) => s + (b.total - b.paidAmount), 0);

    const lowStockItems = await this.productsService.lowStock(tenantId);

    // Sales trend last 7 days
    const trend: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const total = invoices.filter((inv) => inv.date === ds).reduce((s, inv) => s + inv.total, 0);
      trend.push({ date: ds, total });
    }

    // Top products by revenue
    // (simplified: count invoice items)
    const productRevenue = new Map<string, number>();
    // We'd need invoice items; skip for now, return empty
    const topProducts: { name: string; revenue: number }[] = [];

    return {
      todaysSales,
      receivables,
      payables,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      salesTrend: trend,
      topProducts,
      totalInvoices: invoices.length,
      totalBills: bills.length,
    };
  }
}
