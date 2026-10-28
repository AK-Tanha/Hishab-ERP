import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Tenant } from "../../tenants/entities/tenant.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("roles")
export class Role extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid", nullable: true })
  @Index()
  tenantId!: string | null;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: "tenant_id" })
  tenant!: Tenant | null;

  @Column({ type: "varchar", length: 64, unique: true })
  @Index({ unique: true })
  code!: string;

  @Column({ type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "boolean", default: false })
  isSystem!: boolean;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions!: RolePermission[];
}
