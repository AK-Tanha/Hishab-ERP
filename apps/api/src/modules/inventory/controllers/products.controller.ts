import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductsService } from "../services/products.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CreateProductSchema, UpdateProductSchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("inventory/products")
@UseGuards(AuthGuard, TenantGuard)
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query("search") search?: string, @Query("categoryId") categoryId?: string, @Query("page") page?: string, @Query("limit") limit?: string) {
    return this.svc.list(tenantId, { search, categoryId, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  }

  @Get("low-stock")
  lowStock(@TenantId() tenantId: string) {
    return this.svc.lowStock(tenantId);
  }

  @Get(":id")
  getOne(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.findOne(tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("inventory.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @Body(new ZodValidationPipe(CreateProductSchema)) body: any) {
    return this.svc.create(tenantId, body);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("inventory.*")
  update(@TenantId() tenantId: string, @Param("id") id: string, @Body(new ZodValidationPipe(UpdateProductSchema)) body: any) {
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
