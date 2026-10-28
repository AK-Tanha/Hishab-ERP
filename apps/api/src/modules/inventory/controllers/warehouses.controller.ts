import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { WarehousesService } from "../services/warehouses.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CreateWarehouseSchema, UpdateWarehouseSchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("inventory/warehouses")
@UseGuards(TenantGuard, AuthGuard)
export class WarehousesController {
  constructor(private svc: WarehousesService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.svc.list(tenantId);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("inventory.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateWarehouseSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("inventory.*")
  update(@TenantId() tenantId: string, @Param("id") id: string, @Body(new ZodValidationPipe(UpdateWarehouseSchema)) body: any) {
    return this.svc.update(tenantId, id, body);
  }

  @Delete(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("inventory.*")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.remove(tenantId, id);
  }
}
