import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Like } from "typeorm";
import { Product } from "../entities/product.entity";
import { StockMovement } from "../entities/stock-movement.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>,
  ) {}

  async list(tenantId: string, opts?: { search?: string; categoryId?: string; page?: number; limit?: number }) {
    const where: any = { tenantId, deletedAt: IsNull() };
    if (opts?.categoryId) where.categoryId = opts.categoryId;
    const products = await this.productRepo.find({ where, order: { nameEn: "ASC" } });
    let filtered = products;
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          (p.nameBn ?? "").toLowerCase().includes(q),
      );
    }
    const page = opts?.page ?? 1;
    const limit = Math.min(opts?.limit ?? 1000, 100);
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }

  async findOne(tenantId: string, id: string) {
    const p = await this.productRepo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!p) throw new NotFoundException("Product not found");
    return p;
  }

  async create(tenantId: string, input: any) {
    const existing = await this.productRepo.findOne({ where: { tenantId, sku: input.sku, deletedAt: IsNull() } });
    if (existing) throw new BadRequestException("SKU already exists");
    const p = this.productRepo.create({
      tenantId,
      sku: input.sku,
      nameEn: input.nameEn,
      nameBn: input.nameBn ?? null,
      descriptionEn: input.descriptionEn ?? null,
      descriptionBn: input.descriptionBn ?? null,
      categoryId: input.categoryId ?? null,
      unitId: input.unitId ?? null,
      costPrice: input.costPrice ?? 0,
      sellingPrice: input.sellingPrice ?? 0,
      reorderLevel: input.reorderLevel ?? "0",
      hasVariants: input.hasVariants ?? false,
      isActive: input.isActive ?? true,
    });
    return this.productRepo.save(p);
  }

  async update(tenantId: string, id: string, input: any) {
    const p = await this.findOne(tenantId, id);
    Object.assign(p, input);
    return this.productRepo.save(p);
  }

  async remove(tenantId: string, id: string) {
    const p = await this.findOne(tenantId, id);
    p.deletedAt = new Date();
    return this.productRepo.save(p);
  }

  async getCurrentStock(tenantId: string, productId: string, warehouseId?: string) {
    const qb = this.movementRepo
      .createQueryBuilder("m")
      .select("COALESCE(SUM(m.quantity), 0)", "total")
      .where("m.tenant_id = :tenantId", { tenantId })
      .andWhere("m.product_id = :productId", { productId });
    if (warehouseId) qb.andWhere("m.warehouse_id = :warehouseId", { warehouseId });
    const res = await qb.getRawOne();
    return parseFloat(res?.total ?? "0");
  }

  async lowStock(tenantId: string) {
    const products = await this.productRepo.find({ where: { tenantId, deletedAt: IsNull(), isActive: true } });
    const result = [];
    for (const p of products) {
      const stock = await this.getCurrentStock(tenantId, p.id);
      const reorder = parseFloat(p.reorderLevel);
      if (stock <= reorder) {
        result.push({ product: p, stock, reorderLevel: reorder });
      }
    }
    return result;
  }
}
