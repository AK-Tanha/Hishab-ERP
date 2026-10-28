import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}

  async list(tenantId: string, search?: string) {
    const all = await this.repo.find({ where: { tenantId, deletedAt: IsNull() }, order: { nameEn: "ASC" } });
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((c) => c.nameEn.toLowerCase().includes(q) || (c.nameBn ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(q));
  }

  async findOne(tenantId: string, id: string) {
    const c = await this.repo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!c) throw new NotFoundException("Customer not found");
    return c;
  }

  async create(tenantId: string, input: any) {
    const c = this.repo.create({ tenantId, nameEn: input.nameEn, nameBn: input.nameBn ?? null, phone: input.phone ?? null, email: input.email ?? null, address: input.address ?? null, isActive: true });
    return this.repo.save(c);
  }

  async update(tenantId: string, id: string, input: any) {
    const c = await this.findOne(tenantId, id);
    Object.assign(c, input);
    return this.repo.save(c);
  }

  async remove(tenantId: string, id: string) {
    const c = await this.findOne(tenantId, id);
    c.deletedAt = new Date();
    return this.repo.save(c);
  }
}
