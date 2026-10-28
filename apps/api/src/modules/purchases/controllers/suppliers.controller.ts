import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { SuppliersService } from "../services/suppliers.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { z } from "zod";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

const CreateSupplierSchema = z.object({
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
});

@Controller("purchases/suppliers")
@UseGuards(TenantGuard, AuthGuard)
export class SuppliersController {
  constructor(private svc: SuppliersService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query("search") search?: string) {
    return this.svc.list(tenantId, search);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("purchases.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateSupplierSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("purchases.*")
  update(@TenantId() tenantId: string, @Param("id") id: string, @Body(new ZodValidationPipe(CreateSupplierSchema.partial())) body: any) {
    return this.svc.update(tenantId, id, body);
  }

  @Delete(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("purchases.*")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.remove(tenantId, id);
  }
}
