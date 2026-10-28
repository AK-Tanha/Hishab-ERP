import { Entity, Column, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../database/base.entity";
import { JournalLine } from "./journal-line.entity";

@Entity("journal_entries")
export class JournalEntry extends BaseEntity {
  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId!: string;

  @Column({ name: "entry_number", type: "varchar", length: 64 })
  @Index()
  entryNumber!: string;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ name: "reference_type", type: "varchar", length: 64, nullable: true })
  referenceType!: string | null;

  @Column({ name: "reference_id", type: "uuid", nullable: true })
  referenceId!: string | null;

  @Column({ type: "varchar", length: 16, default: "posted" })
  status!: string; // draft | posted

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy!: string | null;

  @OneToMany(() => JournalLine, (l) => l.journalEntry)
  lines!: JournalLine[];
}
