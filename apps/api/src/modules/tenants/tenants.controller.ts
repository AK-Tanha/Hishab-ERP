import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { RegisterTenantInput } from "@hishab/shared";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { RegisterTenantSchema } from "@hishab/shared";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Roles } from "../../common/decorators/auth.decorators";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/auth.decorators";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/tenant-id.decorator";
import { Public } from "../../common/decorators/auth.decorators";

@Controller("tenants")
@UseGuards(TenantGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body(new ZodValidationPipe(RegisterTenantSchema)) input: RegisterTenantInput) {
    return this.tenantsService.register(input);
  }

  @Get("me")
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("tenants.settings")
  getMe(@TenantId() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Post("invites")
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  @HttpCode(HttpStatus.CREATED)
  invite(@TenantId() tenantId: string, @Body() body: { email: string; roleId: string }, @CurrentUser("sub") userId: string) {
    return this.tenantsService.createInvite(tenantId, { ...body, invitedBy: userId });
  }

  @Get("invites")
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("users.manage")
  listInvites(@TenantId() tenantId: string) {
    return this.tenantsService.listInvites(tenantId);
  }

  @Post("invites/:token/accept")
  @HttpCode(HttpStatus.OK)
  acceptInvite(@Param("token") token: string, @Body() body: { userId: string }) {
    return this.tenantsService.acceptInvite(token, body.userId);
  }
}
