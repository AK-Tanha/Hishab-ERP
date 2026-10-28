import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Invoice } from "./invoice.entity";
import { Customer } from "./customer.entity";

@Entity("payments_received")
export class PaymentReceived extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "invoice_id", type: "uuid", nullable: true })
  invoiceId!: string | null;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: "invoice_id" })
  invoice!: Invoice | null;

  @Column({ name: "customer_id", type: "uuid", nullable: true })
  customerId!: string | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer!: Customer | null;

  @Column({ type: "integer", default: 0 })
  amount!: number;

  @Column({ type: "date" })
  date!: string;

  @Column({ name: "payment_method", type: "varchar", length: 32, default: "cash" })
  paymentMethod!: string; // cash | bkash | nagad | bank | card

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy!: string | null;
}
