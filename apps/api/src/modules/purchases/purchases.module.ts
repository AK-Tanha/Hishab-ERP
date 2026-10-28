import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Supplier } from "./entities/supplier.entity";
import { Bill } from "./entities/bill.entity";
import { BillItem } from "./entities/bill-item.entity";
import { PaymentMade } from "./entities/payment-made.entity";
import { SuppliersService } from "./services/suppliers.service";
import { SuppliersController } from "./controllers/suppliers.controller";
import { BillsService } from "./services/bills.service";
import { BillsController } from "./controllers/bills.controller";
import { CommonModule } from "../../common/common.module";
import { InventoryModule } from "../inventory/inventory.module";
import { AccountingModule } from "../accounting/accounting.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, Bill, BillItem, PaymentMade]),
    CommonModule,
    InventoryModule,
    AccountingModule,
  ],
  controllers: [SuppliersController, BillsController],
  providers: [SuppliersService, BillsService],
  exports: [SuppliersService, BillsService],
})
export class PurchasesModule {}
