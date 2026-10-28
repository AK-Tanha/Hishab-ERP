import { z } from "zod";

export const CreateAccountSchema = z.object({
  code: z.string().min(1).max(32),
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  type: z.enum(["asset", "liability", "equity", "income", "expense"]),
  subtype: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export const UpdateAccountSchema = CreateAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CreateJournalEntrySchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  referenceType: z.string().optional().nullable(),
  referenceId: z.string().uuid().optional().nullable(),
  lines: z.array(
    z.object({
      accountId: z.string().uuid(),
      debit: z.number().int().nonnegative().optional(),
      credit: z.number().int().nonnegative().optional(),
      description: z.string().optional().nullable(),
    }),
  ).min(2),
});
