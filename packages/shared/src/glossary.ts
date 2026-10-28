// Bangla accounting glossary for consistent terminology
export const ACCOUNTING_GLOSSARY: Record<string, { en: string; bn: string }> = {
  ledger: { en: "Ledger", bn: "খতিয়ান" },
  journal: { en: "Journal", bn: "জার্নাল" },
  trialBalance: { en: "Trial Balance", bn: "ট্রায়াল ব্যালেন্স" },
  balanceSheet: { en: "Balance Sheet", bn: "স্থিতিপত্র" },
  profitAndLoss: { en: "Profit & Loss", bn: "লাভ-ক্ষতি" },
  cashBook: { en: "Cash Book", bn: "নগদ বই" },
  bankBook: { en: "Bank Book", bn: "ব্যাংক বই" },
  receivable: { en: "Receivable", bn: "প্রাপ্য" },
  payable: { en: "Payable", bn: "প্রদেয়" },
  debit: { en: "Debit", bn: "ডেবিট" },
  credit: { en: "Credit", bn: "ক্রেডিট" },
  asset: { en: "Asset", bn: "সম্পদ" },
  liability: { en: "Liability", bn: "দায়" },
  equity: { en: "Equity", bn: "মালিকানা" },
  revenue: { en: "Revenue", bn: "আয়" },
  expense: { en: "Expense", bn: "ব্যয়" },
  fiscalYear: { en: "Fiscal Year", bn: "অর্থবছর" },
  depreciation: { en: "Depreciation", bn: "অবচয়" },
  inventory: { en: "Inventory", bn: "ইনভেন্টরি" },
  invoice: { en: "Invoice", bn: "ইনভয়েস" },
  voucher: { en: "Voucher", bn: "ভাউচার" },
};

// Flagged terms for human review
export const GLOSSARY_REVIEW_FLAGS = [
  "Balance Sheet = স্থিতিপত্র (verify with accountant)",
  "Depreciation = অবচয় (verify)",
];
