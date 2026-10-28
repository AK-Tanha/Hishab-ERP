import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { User } from "./user.entity";
import { Role } from "./role.entity";

@Entity("user_roles")
export class UserRole extends BaseEntity {
  @Column({ name: "user_id", type: "uuid" })
  @Index()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "role_id", type: "uuid" })
  @Index()
  roleId!: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @Column({ type: "timestamp with time zone" })
  assignedAt!: Date;
}
