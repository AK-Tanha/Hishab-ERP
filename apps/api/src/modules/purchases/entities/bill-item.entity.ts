import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Bill } from "./bill.entity";
import { Product } from "../../inventory/entities/product.entity";

@Entity("bill_items")
export class BillItem extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "bill_id", type: "uuid" })
  @Index()
  billId!: string;

  @ManyToOne(() => Bill, (b) => b.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bill_id" })
  bill!: Bill;

  @Column({ name: "product_id", type: "uuid", nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "product_id" })
  product!: Product | null;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "numeric", precision: 18, scale: 4 })
  quantity!: string;

  @Column({ name: "unit_cost", type: "integer", default: 0 })
  unitCost!: number;

  @Column({ type: "integer", default: 0 })
  total!: number;
}
