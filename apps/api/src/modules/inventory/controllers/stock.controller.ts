import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { StockService } from "../services/stock.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { StockAdjustmentSchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../../common/decorators/tenant-id.decorator";

@Controller("inventory/stock")
@UseGuards(AuthGuard, TenantGuard)
export class StockController {
  constructor(private svc: StockService) {}

  @Get("ledger")
  ledger(@TenantId() tenantId: string, @Query("productId") productId?: string, @Query("warehouseId") warehouseId?: string) {
    return this.svc.ledger(tenantId, { productId, warehouseId });
  }

  @Post("adjust")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "storekeeper")
  @Permissions("inventory.*")
  @HttpCode(HttpStatus.CREATED)
  adjust(@TenantId() tenantId: string, @CurrentUser("sub") userId: string, @Body(new ZodValidationPipe(StockAdjustmentSchema)) body: any) {
    return this.svc.adjust(tenantId, userId, body);
  }
}
