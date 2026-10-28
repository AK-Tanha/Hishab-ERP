import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { JournalEntry } from "../entities/journal-entry.entity";
import { JournalLine } from "../entities/journal-line.entity";

export interface JournalLineInput {
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string | null;
}

export interface CreateJournalEntryInput {
  date: string;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  lines: JournalLineInput[];
}

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry) private entryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalLine) private lineRepo: Repository<JournalLine>,
    private dataSource: DataSource,
  ) {}

  async create(tenantId: string, userId: string | null, input: CreateJournalEntryInput) {
    if (!input.lines || input.lines.length < 2) {
      throw new BadRequestException("A journal entry needs at least two lines");
    }
    let totalDebit = 0;
    let totalCredit = 0;
    for (const l of input.lines) {
      totalDebit += l.debit ?? 0;
      totalCredit += l.credit ?? 0;
      if ((l.debit ?? 0) < 0 || (l.credit ?? 0) < 0) {
        throw new BadRequestException("Debit/credit cannot be negative");
      }
      if ((l.debit ?? 0) > 0 && (l.credit ?? 0) > 0) {
        throw new BadRequestException("A line cannot have both debit and credit");
      }
    }
    if (totalDebit !== totalCredit) {
      throw new BadRequestException(`Unbalanced entry: debit ${totalDebit} != credit ${totalCredit}`);
    }
    if (totalDebit === 0) {
      throw new BadRequestException("Entry amount cannot be zero");
    }

    return this.dataSource.transaction(async (manager) => {
      const count = await manager.count(JournalEntry, { where: { tenantId } });
      const entryNumber = `JE-${String(count + 1).padStart(6, "0")}`;
      const entry = manager.create(JournalEntry, {
        tenantId,
        entryNumber,
        date: input.date,
        description: input.description,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        status: "posted",
        createdBy: userId,
      });
      const savedEntry = await manager.save(entry);

      const lines = input.lines.map((l) =>
        manager.create(JournalLine, {
          tenantId,
          journalEntryId: savedEntry.id,
          accountId: l.accountId,
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
          description: l.description ?? null,
        }),
      );
      await manager.save(lines);
      return savedEntry;
    });
  }

  async list(tenantId: string, opts?: { limit?: number }) {
    return this.entryRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: opts?.limit ?? 50,
      relations: ["lines", "lines.account"],
    });
  }

  async findOne(tenantId: string, id: string) {
    const e = await this.entryRepo.findOne({ where: { id, tenantId }, relations: ["lines", "lines.account"] });
    if (!e) throw new NotFoundException("Journal entry not found");
    return e;
  }
}
