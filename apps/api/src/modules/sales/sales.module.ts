import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./entities/customer.entity";
import { Invoice } from "./entities/invoice.entity";
import { InvoiceItem } from "./entities/invoice-item.entity";
import { PaymentReceived } from "./entities/payment-received.entity";
import { CustomersService } from "./services/customers.service";
import { CustomersController } from "./controllers/customers.controller";
import { InvoicesService } from "./services/invoices.service";
import { InvoicesController } from "./controllers/invoices.controller";
import { CommonModule } from "../../common/common.module";
import { InventoryModule } from "../inventory/inventory.module";
import { AccountingModule } from "../accounting/accounting.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Invoice, InvoiceItem, PaymentReceived]),
    CommonModule,
    InventoryModule,
    AccountingModule,
  ],
  controllers: [CustomersController, InvoicesController],
  providers: [CustomersService, InvoicesService],
  exports: [CustomersService, InvoicesService],
})
export class SalesModule {}
