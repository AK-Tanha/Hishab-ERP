import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Supplier } from "../entities/supplier.entity";

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private repo: Repository<Supplier>) {}

  async list(tenantId: string, search?: string) {
    const all = await this.repo.find({ where: { tenantId, deletedAt: IsNull() }, order: { nameEn: "ASC" } });
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((s) => s.nameEn.toLowerCase().includes(q) || (s.nameBn ?? "").toLowerCase().includes(q) || (s.phone ?? "").includes(q));
  }

  async findOne(tenantId: string, id: string) {
    const s = await this.repo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!s) throw new NotFoundException("Supplier not found");
    return s;
  }

  async create(tenantId: string, input: any) {
    const s = this.repo.create({ tenantId, nameEn: input.nameEn, nameBn: input.nameBn ?? null, phone: input.phone ?? null, email: input.email ?? null, address: input.address ?? null, isActive: true });
    return this.repo.save(s);
  }

  async update(tenantId: string, id: string, input: any) {
    const s = await this.findOne(tenantId, id);
    Object.assign(s, input);
    return this.repo.save(s);
  }

  async remove(tenantId: string, id: string) {
    const s = await this.findOne(tenantId, id);
    s.deletedAt = new Date();
    return this.repo.save(s);
  }
}
