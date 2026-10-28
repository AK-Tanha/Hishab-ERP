import { Entity, Column, Index } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";

@Entity("units")
export class Unit extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid", nullable: true })
  @Index()
  tenantId!: string | null;

  @Column({ type: "varchar", length: 32, unique: true })
  @Index({ unique: true })
  code!: string;

  @Column({ name: "name_en", type: "varchar", length: 64 })
  nameEn!: string;

  @Column({ name: "name_bn", type: "varchar", length: 64, nullable: true })
  nameBn!: string | null;

  @Column({ name: "is_system", type: "boolean", default: false })
  isSystem!: boolean;
}
