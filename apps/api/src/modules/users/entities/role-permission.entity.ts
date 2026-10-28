import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity("role_permissions")
export class RolePermission extends BaseEntity {
  @Column({ name: "role_id", type: "uuid" })
  @Index()
  roleId!: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @Column({ name: "permission_id", type: "uuid" })
  @Index()
  permissionId!: string;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: "permission_id" })
  permission!: Permission;
}
