import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Invoice } from "./invoice.entity";
import { Product } from "../../inventory/entities/product.entity";

@Entity("invoice_items")
export class InvoiceItem extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "invoice_id", type: "uuid" })
  @Index()
  invoiceId!: string;

  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  invoice!: Invoice;

  @Column({ name: "product_id", type: "uuid", nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "product_id" })
  product!: Product | null;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "numeric", precision: 18, scale: 4 })
  quantity!: string;

  @Column({ name: "unit_price", type: "integer", default: 0 })
  unitPrice!: number;

  @Column({ type: "integer", default: 0 })
  total!: number;
}
