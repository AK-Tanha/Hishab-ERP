import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { UnitsService } from "../services/units.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CreateUnitSchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("inventory/units")
@UseGuards(AuthGuard, TenantGuard)
export class UnitsController {
  constructor(private svc: UnitsService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.svc.list(tenantId);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("inventory.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateUnitSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }
}
