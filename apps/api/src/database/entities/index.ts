import { Account } from "../../modules/accounting/entities/account.entity";
import { JournalEntry } from "../../modules/accounting/entities/journal-entry.entity";
import { JournalLine } from "../../modules/accounting/entities/journal-line.entity";
import { Category } from "../../modules/inventory/entities/category.entity";
import { Product } from "../../modules/inventory/entities/product.entity";
import { StockMovement } from "../../modules/inventory/entities/stock-movement.entity";
import { Unit } from "../../modules/inventory/entities/unit.entity";
import { Warehouse } from "../../modules/inventory/entities/warehouse.entity";
import { BillItem } from "../../modules/purchases/entities/bill-item.entity";
import { Bill } from "../../modules/purchases/entities/bill.entity";
import { PaymentMade } from "../../modules/purchases/entities/payment-made.entity";
import { Supplier } from "../../modules/purchases/entities/supplier.entity";
import { Customer } from "../../modules/sales/entities/customer.entity";
import { InvoiceItem } from "../../modules/sales/entities/invoice-item.entity";
import { Invoice } from "../../modules/sales/entities/invoice.entity";
import { PaymentReceived } from "../../modules/sales/entities/payment-received.entity";
import { TenantInvite } from "../../modules/tenants/entities/tenant-invite.entity";
import { Tenant } from "../../modules/tenants/entities/tenant.entity";
import { Permission } from "../../modules/users/entities/permission.entity";
import { RolePermission } from "../../modules/users/entities/role-permission.entity";
import { Role } from "../../modules/users/entities/role.entity";
import { UserRole } from "../../modules/users/entities/user-role.entity";
import { User } from "../../modules/users/entities/user.entity";

export const entities = [
  Account,
  JournalEntry,
  JournalLine,
  Category,
  Product,
  StockMovement,
  Unit,
  Warehouse,
  BillItem,
  Bill,
  PaymentMade,
  Supplier,
  Customer,
  InvoiceItem,
  Invoice,
  PaymentReceived,
  TenantInvite,
  Tenant,
  Permission,
  RolePermission,
  Role,
  UserRole,
  User,
];