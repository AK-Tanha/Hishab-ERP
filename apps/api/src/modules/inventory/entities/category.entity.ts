import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "name_en", type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ name: "name_bn", type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent!: Category | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
