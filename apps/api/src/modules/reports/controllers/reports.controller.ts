import { Controller, Get, Query, UseGuards, Header } from "@nestjs/common";
import { ReportsService } from "../services/reports.service";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("reports")
@UseGuards(AuthGuard, TenantGuard)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Get("sales")
  sales(@TenantId() tenantId: string, @Query("from") from?: string, @Query("to") to?: string) {
    return this.svc.salesReport(tenantId, from, to);
  }

  @Get("stock")
  stock(@TenantId() tenantId: string) {
    return this.svc.stockReport(tenantId);
  }

  @Get("receivables")
  receivables(@TenantId() tenantId: string) {
    return this.svc.receivablesReport(tenantId);
  }

  @Get("payables")
  payables(@TenantId() tenantId: string) {
    return this.svc.payablesReport(tenantId);
  }

  @Get("profit-loss")
  profitLoss(@TenantId() tenantId: string, @Query("from") from?: string, @Query("to") to?: string) {
    return this.svc.profitLoss(tenantId, from, to);
  }
}
