import { z } from "zod";

export const currencySchema = z.enum(["BDT"]);
export type Currency = z.infer<typeof currencySchema>;

export const languageSchema = z.enum(["en", "bn"]);
export type Language = z.infer<typeof languageSchema>;

export const roleCodeSchema = z.enum(["owner", "admin", "accountant", "sales", "storekeeper"]);
export type RoleCode = z.infer<typeof roleCodeSchema>;

export const tenantPlanSchema = z.enum(["starter", "growth", "enterprise"]);
export type TenantPlan = z.infer<typeof tenantPlanSchema>;

export const poishaSchema = z.number().int().nonnegative();
export type Poisha = z.infer<typeof poishaSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["ASC", "DESC"]).default("ASC"),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  timestamp: z.string(),
  path: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const Money = {
  format(poisha: number | null | undefined, opts?: { locale?: Language; banglaDigits?: boolean }): string {
    if (poisha === null || poisha === undefined) return "0.00";
    const bdt = poisha / 100;
    const locale = opts?.locale === "bn" ? "bn-BD" : "en-BD";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(bdt);
  },

  toBDT(poisha: number): number {
    return poisha / 100;
  },

  toPoisha(bdt: number): number {
    return Math.round(bdt * 100);
  },
};

export const BDT_SYMBOL = "৳";

export const DEFAULT_FISCAL_YEAR_START_MONTH = 7; // July

export const ROLE_PERMISSIONS: Record<RoleCode, string[]> = {
  owner: ["*"],
  admin: [
    "users.manage", "roles.manage", "tenants.settings",
    "inventory.*", "sales.*", "purchases.*", "accounting.*", "reports.*",
  ],
  accountant: ["accounting.*", "sales.invoice.view", "sales.payment.*", "purchases.bill.view", "reports.*"],
  sales: ["sales.*", "customers.*", "inventory.product.view", "reports.sales.view"],
  storekeeper: ["inventory.*", "products.view", "stock.adjustment"],
} as const;

export * from "./auth.schema";
export * from "./glossary";
