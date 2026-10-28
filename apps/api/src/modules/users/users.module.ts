import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { UserRole } from "./entities/user-role.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, UserRole, RolePermission]), CommonModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
