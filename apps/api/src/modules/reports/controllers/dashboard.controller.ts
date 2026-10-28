import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "../services/dashboard.service";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("reports/dashboard")
@UseGuards(TenantGuard, AuthGuard)
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get()
  get(@TenantId() tenantId: string) {
    return this.svc.get(tenantId);
  }
}
