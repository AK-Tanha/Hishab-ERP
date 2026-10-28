import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CreateAccountSchema, UpdateAccountSchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("accounting/accounts")
@UseGuards(TenantGuard, AuthGuard)
export class AccountsController {
  constructor(private svc: AccountsService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.svc.list(tenantId);
  }

  @Post("seed")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "accountant")
  @Permissions("accounting.*")
  @HttpCode(HttpStatus.OK)
  seed(@TenantId() tenantId: string) {
    return this.svc.seedForTenant(tenantId);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "accountant")
  @Permissions("accounting.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateAccountSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "accountant")
  @Permissions("accounting.*")
  update(@TenantId() tenantId: string, @Param("id") id: string, @Body(new ZodValidationPipe(UpdateAccountSchema)) body: any) {
    return this.svc.update(tenantId, id, body);
  }
}
