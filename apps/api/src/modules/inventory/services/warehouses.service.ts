import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Warehouse } from "../entities/warehouse.entity";

@Injectable()
export class WarehousesService {
  constructor(@InjectRepository(Warehouse) private repo: Repository<Warehouse>) {}

  async list(tenantId: string) {
    return this.repo.find({ where: { tenantId, deletedAt: IsNull() }, order: { nameEn: "ASC" } });
  }

  async findOne(tenantId: string, id: string) {
    const w = await this.repo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!w) throw new NotFoundException("Warehouse not found");
    return w;
  }

  async create(tenantId: string, input: { nameEn: string; nameBn?: string | null; address?: string | null; isDefault?: boolean }) {
    if (input.isDefault) {
      await this.repo.update({ tenantId, deletedAt: IsNull() }, { isDefault: false });
    }
    const w = this.repo.create({
      tenantId,
      nameEn: input.nameEn,
      nameBn: input.nameBn ?? null,
      address: input.address ?? null,
      isDefault: input.isDefault ?? false,
      isActive: true,
    });
    return this.repo.save(w);
  }

  async update(tenantId: string, id: string, input: { nameEn?: string; nameBn?: string | null; address?: string | null; isDefault?: boolean; isActive?: boolean }) {
    const w = await this.findOne(tenantId, id);
    if (input.isDefault) {
      await this.repo.update({ tenantId, deletedAt: IsNull() }, { isDefault: false });
    }
    Object.assign(w, input);
    return this.repo.save(w);
  }

  async remove(tenantId: string, id: string) {
    const w = await this.findOne(tenantId, id);
    w.deletedAt = new Date();
    return this.repo.save(w);
  }
}
