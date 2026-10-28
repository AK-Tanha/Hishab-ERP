import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Bill } from "./bill.entity";
import { Supplier } from "./supplier.entity";

@Entity("payments_made")
export class PaymentMade extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "bill_id", type: "uuid", nullable: true })
  billId!: string | null;

  @ManyToOne(() => Bill, { nullable: true })
  @JoinColumn({ name: "bill_id" })
  bill!: Bill | null;

  @Column({ name: "supplier_id", type: "uuid", nullable: true })
  supplierId!: string | null;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: "supplier_id" })
  supplier!: Supplier | null;

  @Column({ type: "integer", default: 0 })
  amount!: number;

  @Column({ type: "date" })
  date!: string;

  @Column({ name: "payment_method", type: "varchar", length: 32, default: "cash" })
  paymentMethod!: string;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy!: string | null;
}
