import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Customer } from "./customer.entity";
import { InvoiceItem } from "./invoice-item.entity";

@Entity("invoices")
export class Invoice extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "invoice_number", type: "varchar", length: 64 })
  @Index()
  invoiceNumber!: string;

  @Column({ name: "customer_id", type: "uuid", nullable: true })
  customerId!: string | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer!: Customer | null;

  @Column({ type: "date" })
  date!: string;

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate!: string | null;

  @Column({ type: "varchar", length: 16, default: "draft" })
  status!: string; // draft | posted | paid | partial | cancelled

  @Column({ name: "subtotal", type: "integer", default: 0 })
  subtotal!: number;

  @Column({ name: "discount", type: "integer", default: 0 })
  discount!: number;

  @Column({ name: "vat", type: "integer", default: 0 })
  vat!: number;

  @Column({ name: "total", type: "integer", default: 0 })
  total!: number;

  @Column({ name: "paid_amount", type: "integer", default: 0 })
  paidAmount!: number;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy!: string | null;

  @OneToMany(() => InvoiceItem, (i) => i.invoice)
  items!: InvoiceItem[];
}
