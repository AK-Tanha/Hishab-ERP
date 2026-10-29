import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { CustomersService } from "../services/customers.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { z } from "zod";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

const CreateCustomerSchema = z.object({
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
});

@Controller("sales/customers")
@UseGuards(AuthGuard, TenantGuard)
export class CustomersController {
  constructor(private svc: CustomersService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query("search") search?: string) {
    return this.svc.list(tenantId, search);
  }

  @Get(":id")
  findOne(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.findOne(tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "sales")
  @Permissions("sales.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateCustomerSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "sales")
  @Permissions("sales.*")
  update(@TenantId() tenantId: string, @Param("id") id: string, @Body(new ZodValidationPipe(CreateCustomerSchema.partial())) body: any) {
    return this.svc.update(tenantId, id, body);
  }

  @Delete(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin")
  @Permissions("sales.*")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.remove(tenantId, id);
  }
}
