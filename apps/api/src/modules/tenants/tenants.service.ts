import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { Tenant } from "./entities/tenant.entity";
import { TenantInvite } from "./entities/tenant-invite.entity";
import { User } from "../users/entities/user.entity";
import { Role } from "../users/entities/role.entity";
import { UserRole } from "../users/entities/user-role.entity";
import { UsersService } from "../users/users.service";
import { Warehouse } from "../inventory/entities/warehouse.entity";
import { RegisterTenantInput } from "@hishab/shared";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantInvite) private inviteRepo: Repository<TenantInvite>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @InjectRepository(Warehouse) private warehouseRepo: Repository<Warehouse>,
    private dataSource: DataSource,
    private usersService: UsersService,
  ) {}

  async register(input: RegisterTenantInput) {
    const existing = await this.tenantRepo.findOne({ where: { subdomain: input.subdomain } });
    if (existing) {
      throw new BadRequestException("Subdomain already taken");
    }
    const existingUser = await this.userRepo.findOne({ where: { email: input.ownerEmail, deletedAt: IsNull() } });
    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const savedTenant = await this.dataSource.transaction(async (manager) => {
      const tenant = manager.create(Tenant, {
        nameEn: input.businessNameEn,
        nameBn: input.businessNameBn,
        subdomain: input.subdomain,
        plan: input.plan,
        fiscalYearStartMonth: 7,
        isActive: true,
      });
      const t = await manager.save(tenant);

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = manager.create(User, {
        tenantId: t.id,
        email: input.ownerEmail,
        phone: input.ownerPhone,
        passwordHash,
        nameEn: input.ownerNameEn,
        nameBn: input.ownerNameBn,
        isActive: true,
        emailVerifiedAt: new Date(),
      });
      await manager.save(user);
      return { tenant: t, user };
    });

    await this.usersService.seedDefaultRolesAndPermissions(savedTenant.tenant.id);

    await this.warehouseRepo.save(
      this.warehouseRepo.create({
        tenantId: savedTenant.tenant.id,
        nameEn: "Main Warehouse",
        nameBn: "প্রধান গুদাম",
        isDefault: true,
        isActive: true,
      }),
    );

    const ownerRole = await this.roleRepo.findOne({
      where: { tenantId: savedTenant.tenant.id, code: "owner" },
    });
    if (ownerRole) {
      await this.userRoleRepo.save(
        this.userRoleRepo.create({
          userId: savedTenant.user.id,
          roleId: ownerRole.id,
          assignedAt: new Date(),
        }),
      );
    }

    return savedTenant;
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.tenantRepo.findOne({ where: { subdomain, deletedAt: IsNull() } });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async createInvite(tenantId: string, input: { email: string; roleId: string; invitedBy: string }) {
    const existing = await this.inviteRepo.findOne({
      where: { email: input.email, tenantId, acceptedAt: IsNull() },
    });
    if (existing) {
      throw new BadRequestException("An active invite already exists for this email");
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = this.inviteRepo.create({
      tenantId,
      invitedBy: input.invitedBy,
      email: input.email,
      roleId: input.roleId,
      token,
      expiresAt,
    });
    return this.inviteRepo.save(invite);
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.inviteRepo.findOne({ where: { token, acceptedAt: IsNull() } });
    if (!invite) throw new NotFoundException("Invite not found or already accepted");
    if (invite.expiresAt < new Date()) throw new BadRequestException("Invite has expired");

    invite.acceptedAt = new Date();
    await this.inviteRepo.save(invite);
    return invite;
  }

  async listInvites(tenantId: string) {
    return this.inviteRepo.find({ where: { tenantId }, order: { createdAt: "DESC" } });
  }
}
