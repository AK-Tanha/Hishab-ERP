import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { JournalEntry } from "./journal-entry.entity";
import { Account } from "./account.entity";

@Entity("journal_lines")
export class JournalLine extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "journal_entry_id", type: "uuid" })
  @Index()
  journalEntryId!: string;

  @ManyToOne(() => JournalEntry, (je) => je.lines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "journal_entry_id" })
  journalEntry!: JournalEntry;

  @Column({ name: "account_id", type: "uuid" })
  @Index()
  accountId!: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: "account_id" })
  account!: Account;

  @Column({ type: "integer", default: 0 })
  debit!: number;

  @Column({ type: "integer", default: 0 })
  credit!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
