import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Account } from "../entities/account.entity";

const DEFAULT_COA: { code: string; nameEn: string; nameBn: string; type: string; subtype?: string; parentCode?: string; isSystem?: boolean }[] = [
  // Assets
  { code: "1000", nameEn: "Assets", nameBn: "সম্পদ", type: "asset", subtype: "group", isSystem: true },
  { code: "1100", nameEn: "Current Assets", nameBn: "চলতি সম্পদ", type: "asset", subtype: "group", parentCode: "1000", isSystem: true },
  { code: "1110", nameEn: "Cash", nameBn: "নগদ", type: "asset", subtype: "cash", parentCode: "1100", isSystem: true },
  { code: "1120", nameEn: "Bank", nameBn: "ব্যাংক", type: "asset", subtype: "bank", parentCode: "1100", isSystem: true },
  { code: "1130", nameEn: "Accounts Receivable", nameBn: "প্রাপ্য হিসাব", type: "asset", subtype: "receivable", parentCode: "1100", isSystem: true },
  { code: "1140", nameEn: "Inventory", nameBn: "ইনভেন্টরি", type: "asset", subtype: "inventory", parentCode: "1100", isSystem: true },
  { code: "1200", nameEn: "Fixed Assets", nameBn: "স্থায়ী সম্পদ", type: "asset", subtype: "group", parentCode: "1000", isSystem: true },
  { code: "1210", nameEn: "Equipment", nameBn: "যন্ত্রপাতি", type: "asset", subtype: "fixed", parentCode: "1200", isSystem: true },
  // Liabilities
  { code: "2000", nameEn: "Liabilities", nameBn: "দায়", type: "liability", subtype: "group", isSystem: true },
  { code: "2100", nameEn: "Current Liabilities", nameBn: "চলতি দায়", type: "liability", subtype: "group", parentCode: "2000", isSystem: true },
  { code: "2110", nameEn: "Accounts Payable", nameBn: "প্রদেয় হিসাব", type: "liability", subtype: "payable", parentCode: "2100", isSystem: true },
  { code: "2120", nameEn: "VAT Payable", nameBn: "ভ্যাট প্রদেয়", type: "liability", subtype: "tax", parentCode: "2100", isSystem: true },
  { code: "2130", nameEn: "Salary Payable", nameBn: "বেতন প্রদেয়", type: "liability", subtype: "payable", parentCode: "2100", isSystem: true },
  // Equity
  { code: "3000", nameEn: "Equity", nameBn: "মালিকানা", type: "equity", subtype: "group", isSystem: true },
  { code: "3100", nameEn: "Owner's Capital", nameBn: "মালিকের মূলধন", type: "equity", subtype: "capital", parentCode: "3000", isSystem: true },
  { code: "3200", nameEn: "Retained Earnings", nameBn: "জমাকৃত আয়", type: "equity", subtype: "retained", parentCode: "3000", isSystem: true },
  // Income
  { code: "4000", nameEn: "Income", nameBn: "আয়", type: "income", subtype: "group", isSystem: true },
  { code: "4100", nameEn: "Sales Revenue", nameBn: "বিক্রয় আয়", type: "income", subtype: "sales", parentCode: "4000", isSystem: true },
  { code: "4200", nameEn: "Other Income", nameBn: "অন্যান্য আয়", type: "income", subtype: "other", parentCode: "4000", isSystem: true },
  // Expenses
  { code: "5000", nameEn: "Expenses", nameBn: "ব্যয়", type: "expense", subtype: "group", isSystem: true },
  { code: "5100", nameEn: "Cost of Goods Sold", nameBn: "বিক্রিত পণ্যের খরচ", type: "expense", subtype: "cogs", parentCode: "5000", isSystem: true },
  { code: "5200", nameEn: "Operating Expenses", nameBn: "পরিচালন ব্যয়", type: "expense", subtype: "group", parentCode: "5000", isSystem: true },
  { code: "5210", nameEn: "Rent", nameBn: "ভাড়া", type: "expense", subtype: "rent", parentCode: "5200", isSystem: true },
  { code: "5220", nameEn: "Salaries", nameBn: "বেতন", type: "expense", subtype: "salary", parentCode: "5200", isSystem: true },
  { code: "5230", nameEn: "Utilities", nameBn: "ইউটিলিটি", type: "expense", subtype: "utility", parentCode: "5200", isSystem: true },
  { code: "5240", nameEn: "Transport", nameBn: "পরিবহন", type: "expense", subtype: "transport", parentCode: "5200", isSystem: true },
  { code: "5300", nameEn: "Depreciation", nameBn: "অবচয়", type: "expense", subtype: "depreciation", parentCode: "5000", isSystem: true },
];

@Injectable()
export class AccountsService implements OnModuleInit {
  constructor(@InjectRepository(Account) private repo: Repository<Account>) {}

  async onModuleInit() {
    // seeding is per-tenant, done on first access; here we just ensure nothing global
  }

  async seedForTenant(tenantId: string) {
    const count = await this.repo.count({ where: { tenantId } });
    if (count > 0) return;
    const codeToId = new Map<string, string>();
    // insert parents first by sorting (parents have lower code depth)
    const sorted = [...DEFAULT_COA].sort((a, b) => a.code.length - b.code.length || a.code.localeCompare(b.code));
    for (const a of sorted) {
      const parent = a.parentCode ? codeToId.get(a.parentCode) ?? null : null;
      const acc = this.repo.create({
        tenantId,
        code: a.code,
        nameEn: a.nameEn,
        nameBn: a.nameBn,
        type: a.type,
        subtype: a.subtype ?? null,
        parentId: parent,
        isSystem: a.isSystem ?? false,
        isActive: true,
      });
      const saved = await this.repo.save(acc);
      codeToId.set(a.code, saved.id);
    }
  }

  async list(tenantId: string) {
    await this.seedForTenant(tenantId);
    return this.repo.find({ where: { tenantId, deletedAt: IsNull() }, order: { code: "ASC" } });
  }

  async findOne(tenantId: string, id: string) {
    const a = await this.repo.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    if (!a) throw new NotFoundException("Account not found");
    return a;
  }

  async findByCode(tenantId: string, code: string) {
    const a = await this.repo.findOne({ where: { tenantId, code, deletedAt: IsNull() } });
    if (!a) throw new NotFoundException(`Account ${code} not found`);
    return a;
  }

  async create(tenantId: string, input: any) {
    const a = this.repo.create({
      tenantId,
      code: input.code,
      nameEn: input.nameEn,
      nameBn: input.nameBn ?? null,
      type: input.type,
      subtype: input.subtype ?? null,
      parentId: input.parentId ?? null,
      isSystem: false,
      isActive: true,
    });
    return this.repo.save(a);
  }

  async update(tenantId: string, id: string, input: any) {
    const a = await this.findOne(tenantId, id);
    Object.assign(a, input);
    return this.repo.save(a);
  }
}
