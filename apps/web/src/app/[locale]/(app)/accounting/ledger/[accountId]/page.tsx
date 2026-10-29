"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  FileText,
  Wallet,
  ArrowUpRight,
  DollarSign,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type LedgerRow = {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

type LedgerResult = {
  account?: { id: string; code: string; nameEn: string; nameBn?: string | null; type: string } | null;
  rows: LedgerRow[];
  closingBalance: number;
  openingBalance?: number;
  totalDebit?: number;
  totalCredit?: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((value || 0) / 100);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/* ---------- component ---------- */

export default function LedgerPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = React.use(params);
  const t = useTranslations("accounting");

  const { data, isLoading } = useQuery({
    queryKey: ["ledger", accountId],
    queryFn: () =>
      apiFetch(`${API}/api/v1/accounting/ledger/${accountId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
    enabled: !!accountId,
  });

  const result = (data?.data ?? data ?? {
    account: null,
    rows: [],
    closingBalance: 0,
  }) as LedgerResult;
  const rows = result.rows ?? [];
  const account = result.account ?? null;

  const totalDebit = result.totalDebit ?? rows.reduce((s, r) => s + (r.debit || 0), 0);
  const totalCredit = result.totalCredit ?? rows.reduce((s, r) => s + (r.credit || 0), 0);
  const openingBalance = result.openingBalance ?? 0;
  const closingBalance = result.closingBalance ?? 0;

  if (isLoading || !account) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/accounting"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t("ledger")}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Account ledger and transaction history
              </p>
            </div>
          </div>
          <div className="space-y-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </section>
            <aside className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageGuard requiredPermission="accounting.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/accounting"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to chart of accounts"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {account.nameEn}
                </h1>
                {account.nameBn && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 lang-bn">
                    {account.nameBn}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {account.code} &bull; {account.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/accounting/ledger/${account.id}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Download ledger"
              >
                <Download className="h-4 w-4" />
              </Link>
              <Link
                href={`/accounting/ledger/${account.id}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="View ledger"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: "Opening Balance",
                value: formatCurrency(openingBalance),
                icon: DollarSign,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("totalDebit"),
                value: formatCurrency(totalDebit),
                icon: ArrowUpRight,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: t("totalCredit"),
                value: formatCurrency(totalCredit),
                icon: Wallet,
                tint: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-50",
              },
              {
                label: t("balance"),
                value: formatCurrency(closingBalance),
                icon: Clock,
                tint:
                  closingBalance >= 0
                    ? "from-emerald-500/10 to-emerald-500/5"
                    : "from-rose-500/10 to-rose-500/5",
                iconColor: closingBalance >= 0 ? "text-emerald-600" : "text-rose-600",
                iconBg: closingBalance >= 0 ? "bg-emerald-50" : "bg-rose-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ring-1 ring-slate-100 dark:ring-slate-700`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- Ledger table ---------- */}
          <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Transaction History
                </h2>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {rows.length} entr{rows.length !== 1 ? "ies" : "y"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("date")}
                    </th>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Entry
                    </th>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("description")}
                    </th>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">
                      {t("debit")}
                    </th>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">
                      {t("credit")}
                    </th>
                    <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">
                      {t("balance")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr
                        key={r.entryNumber ?? i}
                        className="group hover:bg-slate-50/60 hover:dark:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(r.date)}
                        </td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-400 dark:text-slate-500">
                          {r.entryNumber}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                          {r.description}
                        </td>
                        <td className="px-3 py-3 text-xs text-right text-slate-600 dark:text-slate-400">
                          {r.debit > 0 ? formatCurrency(r.debit) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-right text-slate-600 dark:text-slate-400">
                          {r.credit > 0 ? formatCurrency(r.credit) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-right font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(r.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t border-slate-200 dark:border-slate-800">
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">
                      Closing Balance
                    </td>
                    <td className="px-3 py-3 text-right" colSpan={3}>
                      <span className={`text-sm font-bold ${
                        closingBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {formatCurrency(closingBalance)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* ---------- Footer count ---------- */}
          {!isLoading && rows.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{rows.length}</span> entr{rows.length !== 1 ? "ies" : "y"}
              </span>
              <span className="inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Updated just now
              </span>
            </div>
          )}
        </div>
      </div>
    </PageGuard>
  );
}
