import { Entity, Column, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("permissions")
export class Permission extends BaseEntity {
  @Column({ type: "varchar", length: 128, unique: true })
  @Index({ unique: true })
  code!: string;

  @Column({ type: "varchar", length: 255 })
  nameEn!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  nameBn!: string | null;

  @Column({ type: "varchar", length: 64 })
  module!: string;

  @Column({ type: "varchar", length: 32 })
  action!: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions!: RolePermission[];
}
