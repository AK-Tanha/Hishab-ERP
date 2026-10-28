import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Tenant } from "../../tenants/entities/tenant.entity";
import { UserRole } from "./user-role.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenant_id" })
  tenant!: Tenant;

  @Column({ type: "varchar", length: 255, unique: true })
  @Index({ unique: true })
  email!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  emailVerifiedAt!: Date | null;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles!: UserRole[];
}
