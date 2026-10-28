import { Module } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { TenantsController } from "./tenants.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "./entities/tenant.entity";
import { TenantInvite } from "./entities/tenant-invite.entity";
import { CommonModule } from "../../common/common.module";
import { User } from "../users/entities/user.entity";
import { Role } from "../users/entities/role.entity";
import { UserRole } from "../users/entities/user-role.entity";
import { UsersModule } from "../users/users.module";
import { Warehouse } from "../inventory/entities/warehouse.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantInvite, User, Role, UserRole, Warehouse]), CommonModule, UsersModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
