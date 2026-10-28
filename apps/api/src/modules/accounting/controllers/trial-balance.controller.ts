import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { TrialBalanceService } from "../services/trial-balance.service";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("accounting/trial-balance")
@UseGuards(AuthGuard, TenantGuard)
export class TrialBalanceController {
  constructor(private svc: TrialBalanceService) {}

  @Get()
  get(@TenantId() tenantId: string, @Query("from") from?: string, @Query("to") to?: string) {
    return this.svc.get(tenantId, { from, to });
  }
}
