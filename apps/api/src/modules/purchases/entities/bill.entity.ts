import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Supplier } from "./supplier.entity";
import { BillItem } from "./bill-item.entity";

@Entity("bills")
export class Bill extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "bill_number", type: "varchar", length: 64 })
  @Index()
  billNumber!: string;

  @Column({ name: "supplier_id", type: "uuid", nullable: true })
  supplierId!: string | null;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: "supplier_id" })
  supplier!: Supplier | null;

  @Column({ type: "date" })
  date!: string;

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate!: string | null;

  @Column({ type: "varchar", length: 16, default: "draft" })
  status!: string;

  @Column({ name: "subtotal", type: "integer", default: 0 })
  subtotal!: number;

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

  @OneToMany(() => BillItem, (i) => i.bill)
  items!: BillItem[];
}
