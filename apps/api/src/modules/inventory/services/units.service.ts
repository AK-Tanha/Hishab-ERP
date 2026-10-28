import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Unit } from "../entities/unit.entity";

@Injectable()
export class UnitsService implements OnModuleInit {
  constructor(@InjectRepository(Unit) private repo: Repository<Unit>) {}

  async onModuleInit() {
    await this.seedSystemUnits();
  }

  async list(tenantId: string) {
    return this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
      order: { nameEn: "ASC" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const u = await this.repo.findOne({ where: [{ id, tenantId: IsNull() }, { id, tenantId }] });
    if (!u) throw new NotFoundException("Unit not found");
    return u;
  }

  async create(tenantId: string, input: { code: string; nameEn: string; nameBn?: string | null }) {
    const u = this.repo.create({
      tenantId,
      code: input.code.toLowerCase(),
      nameEn: input.nameEn,
      nameBn: input.nameBn ?? null,
      isSystem: false,
    });
    return this.repo.save(u);
  }

  async seedSystemUnits() {
    const existing = await this.repo.count({ where: { isSystem: true } });
    if (existing > 0) return;
    const systemUnits = [
      { code: "pcs", nameEn: "Pieces", nameBn: "পিস", isSystem: true, tenantId: null },
      { code: "kg", nameEn: "Kilogram", nameBn: "কেজি", isSystem: true, tenantId: null },
      { code: "g", nameEn: "Gram", nameBn: "গ্রাম", isSystem: true, tenantId: null },
      { code: "l", nameEn: "Liter", nameBn: "লিটার", isSystem: true, tenantId: null },
      { code: "ml", nameEn: "Milliliter", nameBn: "মিলিলিটার", isSystem: true, tenantId: null },
      { code: "box", nameEn: "Box", nameBn: "বক্স", isSystem: true, tenantId: null },
      { code: "dozen", nameEn: "Dozen", nameBn: "ডজন", isSystem: true, tenantId: null },
      { code: "m", nameEn: "Meter", nameBn: "মিটার", isSystem: true, tenantId: null },
    ];
    await this.repo.save(systemUnits.map((u) => this.repo.create(u)));
  }
}
