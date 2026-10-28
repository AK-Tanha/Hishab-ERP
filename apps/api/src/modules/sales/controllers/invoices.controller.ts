import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { InvoicesService } from "../services/invoices.service";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { z } from "zod";
import { TenantGuard } from "../../../common/guards/tenant.guard";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Roles } from "../../../common/decorators/auth.decorators";
import { Permissions } from "../../../common/decorators/auth.decorators";
import { TenantId } from "../../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../../common/decorators/tenant-id.decorator";

const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  warehouseId: z.string().uuid(),
  date: z.string(),
  dueDate: z.string().optional().nullable(),
  discount: z.number().int().nonnegative().optional(),
  vat: z.number().int().nonnegative().optional(),
  paidAmount: z.number().int().nonnegative().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string().uuid().optional().nullable(),
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().int().nonnegative(),
    }),
  ).min(1),
});

const PaymentSchema = z.object({
  amount: z.number().int().positive(),
  paymentMethod: z.string().optional(),
  date: z.string(),
});

@Controller("sales/invoices")
@UseGuards(AuthGuard, TenantGuard)
export class InvoicesController {
  constructor(private svc: InvoicesService) {}

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
  @Roles("owner", "admin", "sales")
  @Permissions("sales.*")
  @HttpCode(HttpStatus.CREATED)
  create(@TenantId() tenantId: string, @CurrentUser("sub") userId: string, @Body(new ZodValidationPipe(CreateInvoiceSchema)) body: any) {
    const { warehouseId, ...rest } = body;
    return this.svc.create(tenantId, userId, rest, warehouseId);
  }

  @Post(":id/payments")
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles("owner", "admin", "sales")
  @Permissions("sales.*")
  @HttpCode(HttpStatus.CREATED)
  recordPayment(@TenantId() tenantId: string, @CurrentUser("sub") userId: string, @Param("id") id: string, @Body(new ZodValidationPipe(PaymentSchema)) body: any) {
    return this.svc.recordPayment(tenantId, userId, id, body.amount, body.paymentMethod ?? "cash", body.date);
  }
}
