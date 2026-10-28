import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./services/dashboard.service";
import { DashboardController } from "./controllers/dashboard.controller";
import { ReportsService } from "./services/reports.service";
import { ReportsController } from "./controllers/reports.controller";
import { Invoice } from "../sales/entities/invoice.entity";
import { Bill } from "../purchases/entities/bill.entity";
import { Product } from "../inventory/entities/product.entity";
import { StockMovement } from "../inventory/entities/stock-movement.entity";
import { Customer } from "../sales/entities/customer.entity";
import { Supplier } from "../purchases/entities/supplier.entity";
import { CommonModule } from "../../common/common.module";
import { SalesModule } from "../sales/sales.module";
import { PurchasesModule } from "../purchases/purchases.module";
import { InventoryModule } from "../inventory/inventory.module";
import { JournalLine } from "../accounting/entities/journal-line.entity";
import { JournalEntry } from "../accounting/entities/journal-entry.entity";
import { Account } from "../accounting/entities/account.entity";
import { AccountingModule } from "../accounting/accounting.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Bill, Product, StockMovement, Customer, Supplier, JournalLine, JournalEntry, Account]),
    CommonModule,
    SalesModule, PurchasesModule, InventoryModule, AccountingModule,
  ],
  controllers: [DashboardController, ReportsController],
  providers: [DashboardService, ReportsService],
  exports: [DashboardService, ReportsService],
})
export class ReportsModule {}
