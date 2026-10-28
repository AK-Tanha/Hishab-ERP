import { Entity, Column, Index } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";

@Entity("suppliers")
export class Supplier extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "name_en", type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ name: "name_bn", type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "varchar", length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
