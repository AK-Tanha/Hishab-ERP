import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { LedgerService } from "../services/ledger.service";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";

@Controller("accounting/ledger")
@UseGuards(AuthGuard, TenantGuard)
export class LedgerController {
  constructor(private svc: LedgerService) {}

  @Get(":accountId")
  get(@TenantId() tenantId: string, @Param("accountId") accountId: string, @Query("from") from?: string, @Query("to") to?: string) {
    return this.svc.getAccountLedger(tenantId, accountId, { from, to });
  }
}
