import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Tenant } from "./tenant.entity";

@Entity("tenant_invites")
export class TenantInvite extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenant_id" })
  tenant!: Tenant;

  @Column({ name: "invited_by", type: "uuid", nullable: true })
  invitedBy!: string | null;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "role_id", type: "uuid", nullable: true })
  roleId!: string | null;

  @Column({ type: "varchar", length: 255, unique: true })
  @Index({ unique: true })
  token!: string;

  @Column({ type: "timestamp with time zone" })
  expiresAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  acceptedAt!: Date | null;
}
