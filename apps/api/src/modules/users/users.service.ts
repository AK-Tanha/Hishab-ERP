import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, In } from "typeorm";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { UserRole } from "./entities/user-role.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { UpdateUserInput, InviteUserInput } from "@hishab/shared";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission) private rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email, deletedAt: IsNull() } });
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByTenant(tenantId: string) {
    return this.userRepo.find({ where: { tenantId, deletedAt: IsNull() } });
  }

  async getUserRolesAndPermissions(userId: string) {
    const userRoles = await this.userRoleRepo.find({ where: { userId }, relations: ["role"] });
    const roles = userRoles.map((ur) => ur.role);
    const roleIds = roles.map((r) => r.id);
    const rolePerms = await this.rolePermissionRepo.find({ where: { roleId: In(roleIds) } });
    const permissionIds = rolePerms.map((rp) => rp.permissionId);
    const permissions = await this.permissionRepo.find({ where: { id: In(permissionIds) } });

    return {
      roles: roles.map((r) => r.code),
      permissions: permissions.map((p) => p.code),
    };
  }

  async update(userId: string, input: UpdateUserInput) {
    const user = await this.findById(userId);
    Object.assign(user, input);
    return this.userRepo.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException("Current password is incorrect");
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    return this.userRepo.save(user);
  }

  async seedDefaultRolesAndPermissions(tenantId: string) {
    const permissions = [
      { code: "users.manage", nameEn: "Manage Users", nameBn: "ব্যবহারকারী পরিচালনা", module: "users", action: "manage" },
      { code: "roles.manage", nameEn: "Manage Roles", nameBn: "ব叹িত পরিচালনা", module: "roles", action: "manage" },
      { code: "tenants.settings", nameEn: "Tenant Settings", nameBn: "টেনেন্ট সেটিংস", module: "tenants", action: "settings" },
      { code: "inventory.*", nameEn: "All Inventory", nameBn: "সকল ইনভেন্টরি", module: "inventory", action: "*" },
      { code: "sales.*", nameEn: "All Sales", nameBn: "সকল সেলস", module: "sales", action: "*" },
      { code: "purchases.*", nameEn: "All Purchases", nameBn: "সকল ক্রয়", module: "purchases", action: "*" },
      { code: "accounting.*", nameEn: "All Accounting", nameBn: "সকল অ্যাকাউন্টিং", module: "accounting", action: "*" },
      { code: "reports.*", nameEn: "All Reports", nameBn: "সকল রিপোর্ট", module: "reports", action: "*" },
    ];

    const savedPerms = await this.permissionRepo.save(
      permissions.map((p) => this.permissionRepo.create(p)),
    );

    const roles = [
      { code: "owner", nameEn: "Owner", nameBn: "মালিক", isSystem: true, tenantId },
      { code: "admin", nameEn: "Admin", nameBn: "অ্যাডমিন", isSystem: true, tenantId },
      { code: "accountant", nameEn: "Accountant", nameBn: "অ্যাকাউন্ট্যান্ট", isSystem: true, tenantId },
      { code: "sales", nameEn: "Sales", nameBn: "সেলস", isSystem: true, tenantId },
      { code: "storekeeper", nameEn: "Storekeeper", nameBn: "স্টোরকিপার", isSystem: true, tenantId },
    ];

    const savedRoles = await this.roleRepo.save(roles.map((r) => this.roleRepo.create(r)));

    // Owner gets all permissions
    const ownerRole = savedRoles.find((r) => r.code === "owner");
    if (ownerRole) {
      await this.rolePermissionRepo.save(
        savedPerms.map((p) => this.rolePermissionRepo.create({ roleId: ownerRole.id, permissionId: p.id })),
      );
    }

    return { roles: savedRoles, permissions: savedPerms };
  }
}
