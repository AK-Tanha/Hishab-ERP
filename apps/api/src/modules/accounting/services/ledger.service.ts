import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { JournalLine } from "../entities/journal-line.entity";
import { Account } from "../entities/account.entity";
import { AccountsService } from "./accounts.service";

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(JournalLine) private lineRepo: Repository<JournalLine>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private accountsService: AccountsService,
  ) {}

  async getAccountLedger(tenantId: string, accountId: string, opts?: { from?: string; to?: string }) {
    const account = await this.accountsService.findOne(tenantId, accountId);
    const where: any = { tenantId, accountId };
    const lines = await this.lineRepo.find({
      where,
      relations: ["journalEntry"],
      order: { createdAt: "ASC" },
    });

    const filtered = lines.filter((l) => {
      const d = l.journalEntry?.date;
      if (opts?.from && d && d < opts.from) return false;
      if (opts?.to && d && d > opts.to) return false;
      return true;
    });

    const isDebitNormal = account.type === "asset" || account.type === "expense";
    let balance = 0;
    const rows = filtered.map((l) => {
      const delta = isDebitNormal ? l.debit - l.credit : l.credit - l.debit;
      balance += delta;
      return {
        date: l.journalEntry?.date,
        entryNumber: l.journalEntry?.entryNumber,
        description: l.description ?? l.journalEntry?.description,
        debit: l.debit,
        credit: l.credit,
        balance,
      };
    });
    return { account, rows, closingBalance: balance };
  }
}
