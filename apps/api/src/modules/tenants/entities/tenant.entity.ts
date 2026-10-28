import { Entity, Column, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { TenantInvite } from "./tenant-invite.entity";

@Entity("tenants")
export class Tenant extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "varchar", length: 63, unique: true })
  @Index({ unique: true })
  subdomain!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  domain!: string | null;

  @Column({ type: "varchar", length: 32, default: "starter" })
  plan!: string;

  @Column({ type: "smallint", default: 7 })
  fiscalYearStartMonth!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => TenantInvite, (invite) => invite.tenant)
  invites!: TenantInvite[];
}
