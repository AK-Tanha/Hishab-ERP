import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Product } from "./product.entity";
import { Warehouse } from "./warehouse.entity";

@Entity("stock_movements")
export class StockMovement extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "product_id", type: "uuid" })
  @Index()
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "warehouse_id", type: "uuid" })
  @Index()
  warehouseId!: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse!: Warehouse;

  @Column({ type: "varchar", length: 32 })
  type!: string; // in | out | adjustment

  @Column({ type: "numeric", precision: 18, scale: 4 })
  quantity!: string;

  @Column({ name: "reference_type", type: "varchar", length: 64, nullable: true })
  referenceType!: string | null;

  @Column({ name: "reference_id", type: "uuid", nullable: true })
  referenceId!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy!: string | null;
}
