import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { StockMovement } from "../entities/stock-movement.entity";
import { Product } from "../entities/product.entity";
import { Warehouse } from "../entities/warehouse.entity";
import { ProductsService } from "./products.service";
import { WarehousesService } from "./warehouses.service";

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
  ) {}

  async adjust(tenantId: string, userId: string | null, input: {
    productId: string;
    warehouseId: string;
    type: "in" | "out" | "adjustment";
    quantity: number;
    notes?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
  }) {
    await this.productsService.findOne(tenantId, input.productId);
    await this.warehousesService.findOne(tenantId, input.warehouseId);

    if (input.type === "out") {
      const current = await this.productsService.getCurrentStock(tenantId, input.productId, input.warehouseId);
      if (current < input.quantity) {
        throw new BadRequestException("Insufficient stock");
      }
    }

    const movement = this.movementRepo.create({
      tenantId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: input.type,
      quantity: String(input.quantity),
      notes: input.notes ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      createdBy: userId,
    });
    return this.movementRepo.save(movement);
  }

  async ledger(tenantId: string, opts?: { productId?: string; warehouseId?: string; limit?: number }) {
    const where: any = { tenantId };
    if (opts?.productId) where.productId = opts.productId;
    if (opts?.warehouseId) where.warehouseId = opts.warehouseId;
    return this.movementRepo.find({
      where,
      order: { createdAt: "DESC" },
      take: opts?.limit ?? 100,
      relations: ["product", "warehouse"],
    });
  }
}
