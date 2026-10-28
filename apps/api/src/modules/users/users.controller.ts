import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserInput } from "@hishab/shared";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { UpdateUserSchema } from "@hishab/shared";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Roles } from "../../common/decorators/auth.decorators";
import { Permissions } from "../../common/decorators/auth.decorators";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/tenant-id.decorator";

@Controller("users")
@UseGuards(AuthGuard, TenantGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser("sub") userId: string, @TenantId() tenantId: string) {
    return this.usersService.getUserRolesAndPermissions(userId);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  list(@TenantId() tenantId: string) {
    return this.usersService.findByTenant(tenantId);
  }

  @Get(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  getOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  update(@Param("id") id: string, @Body(new ZodValidationPipe(UpdateUserSchema)) input: UpdateUserInput) {
    return this.usersService.update(id, input);
  }

  @Patch(":id/password")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  changePassword(@Param("id") id: string, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(id, body.currentPassword, body.newPassword);
  }
}
