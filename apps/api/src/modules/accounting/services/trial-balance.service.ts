import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { JournalLine } from "../entities/journal-line.entity";
import { Account } from "../entities/account.entity";
import { AccountsService } from "./accounts.service";

@Injectable()
export class TrialBalanceService {
  constructor(
    @InjectRepository(JournalLine) private lineRepo: Repository<JournalLine>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private accountsService: AccountsService,
  ) {}

  async get(tenantId: string, opts?: { from?: string; to?: string }) {
    await this.accountsService.seedForTenant(tenantId);
    const accounts = await this.accountRepo.find({ where: { tenantId, deletedAt: IsNull() }, order: { code: "ASC" } });
    const lines = await this.lineRepo.find({ where: { tenantId }, relations: ["journalEntry"] });

    const filtered = lines.filter((l) => {
      const d = l.journalEntry?.date;
      if (opts?.from && d && d < opts.from) return false;
      if (opts?.to && d && d > opts.to) return false;
      return true;
    });

    const totals = new Map<string, { debit: number; credit: number }>();
    for (const l of filtered) {
      const cur = totals.get(l.accountId) ?? { debit: 0, credit: 0 };
      cur.debit += l.debit;
      cur.credit += l.credit;
      totals.set(l.accountId, cur);
    }

    const rows = accounts
      .map((a) => {
        const t = totals.get(a.id) ?? { debit: 0, credit: 0 };
        return { account: a, debit: t.debit, credit: t.credit };
      })
      .filter((r) => r.debit !== 0 || r.credit !== 0);

    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
    return { rows, totalDebit, totalCredit, balanced: totalDebit === totalCredit };
  }
}
