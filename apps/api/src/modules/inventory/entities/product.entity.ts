import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Category } from "./category.entity";
import { Unit } from "./unit.entity";

@Entity("products")
export class Product extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ type: "varchar", length: 64 })
  @Index()
  sku!: string;

  @Column({ name: "name_en", type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ name: "name_bn", type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ name: "description_en", type: "text", nullable: true })
  descriptionEn!: string | null;

  @Column({ name: "description_bn", type: "text", nullable: true })
  descriptionBn!: string | null;

  @Column({ name: "category_id", type: "uuid", nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category!: Category | null;

  @Column({ name: "unit_id", type: "uuid", nullable: true })
  unitId!: string | null;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: "unit_id" })
  unit!: Unit | null;

  @Column({ name: "cost_price", type: "integer", default: 0 })
  costPrice!: number;

  @Column({ name: "selling_price", type: "integer", default: 0 })
  sellingPrice!: number;

  @Column({ name: "reorder_level", type: "numeric", precision: 18, scale: 4, default: 0 })
  reorderLevel!: string;

  @Column({ name: "has_variants", type: "boolean", default: false })
  hasVariants!: boolean;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
