import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { JournalService } from "../services/journal.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CreateJournalEntrySchema } from "../dto/schemas";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../../common/decorators/tenant-id.decorator";

@Controller("accounting/journal")
@UseGuards(AuthGuard, TenantGuard)
export class JournalController {
  constructor(private svc: JournalService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.svc.list(tenantId);
  }

  @Get(":id")
  getOne(@TenantId() tenantId: string, @Param("id") id: string) {
    return this.svc.findOne(tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "accountant")
  @Permissions("accounting.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @CurrentUser("sub") userId: string, @Body(new ZodValidationPipe(CreateJournalEntrySchema)) body: any) {
    return this.svc.create(tenantId, userId, body);
  }
}
