import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";

@Entity("accounts")
export class Account extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ type: "varchar", length: 32 })
  @Index()
  code!: string;

  @Column({ name: "name_en", type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ name: "name_bn", type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "varchar", length: 32 })
  type!: string; // asset | liability | equity | income | expense

  @Column({ type: "varchar", length: 64, nullable: true })
  subtype!: string | null;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent!: Account | null;

  @Column({ name: "is_system", type: "boolean", default: false })
  isSystem!: boolean;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
