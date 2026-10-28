import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Category } from "../entities/category.entity";

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async list(tenantId: string) {
    return this.repo.find({ where: { tenantId, deletedAt: IsNull() }, order: { nameEn: "ASC" } });
  }

  async findOne(tenantId: string, id: string) {
    const c = await this.repo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!c) throw new NotFoundException("Category not found");
    return c;
  }

  async create(tenantId: string, input: { nameEn: string; nameBn?: string | null; parentId?: string | null }) {
    if (input.parentId) {
      await this.findOne(tenantId, input.parentId);
    }
    const c = this.repo.create({
      tenantId,
      nameEn: input.nameEn,
      nameBn: input.nameBn ?? null,
      parentId: input.parentId ?? null,
      isActive: true,
    });
    return this.repo.save(c);
  }

  async update(tenantId: string, id: string, input: { nameEn?: string; nameBn?: string | null; parentId?: string | null; isActive?: boolean }) {
    const c = await this.findOne(tenantId, id);
    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) throw new BadRequestException("Category cannot be its own parent");
      await this.findOne(tenantId, input.parentId);
    }
    Object.assign(c, input);
    return this.repo.save(c);
  }

  async remove(tenantId: string, id: string) {
    const c = await this.findOne(tenantId, id);
    c.deletedAt = new Date();
    return this.repo.save(c);
  }
}
