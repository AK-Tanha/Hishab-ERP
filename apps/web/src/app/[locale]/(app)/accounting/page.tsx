"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  Plus,
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Book,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Account = {
  id: string;
  code: string;
  nameEn: string;
  nameBn?: string | null;
  type: string;
};

function getTypeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "asset":
      return { icon: Wallet, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", tint: "from-blue-500/10 to-blue-500/5" };
    case "liability":
      return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", tint: "from-amber-500/10 to-amber-500/5" };
    case "equity":
      return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", tint: "from-emerald-500/10 to-emerald-500/5" };
    case "income":
      return { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", tint: "from-emerald-500/10 to-emerald-500/5" };
    case "expense":
      return { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", tint: "from-rose-500/10 to-rose-500/5" };
    default:
      return { icon: FileText, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", tint: "from-slate-500/10 to-slate-500/5" };
  }
}

/* ---------- component ---------- */

export default function ChartOfAccountsPage() {
  const t = useTranslations("accounting");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "asset" | "liability" | "equity" | "income" | "expense">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/accounting/accounts`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const accounts = React.useMemo(
    () => ((data?.data ?? data ?? []) as Account[]),
    [data]
  );

  /* derived stats */
  const stats = React.useMemo(() => {
    const total = accounts.length;
    const byType = accounts.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    return { total, byType };
  }, [accounts]);

  /* filtered list */
  const filtered = React.useMemo(() => {
    return accounts.filter((a) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.code.toLowerCase().includes(q) ||
        a.nameEn?.toLowerCase().includes(q) ||
        a.nameBn?.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" || a.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [accounts, search, filter]);

  const filterTabs = [
    { id: "all" as const, label: "All" },
    { id: "asset" as const, label: "Asset" },
    { id: "liability" as const, label: "Liability" },
    { id: "equity" as const, label: "Equity" },
    { id: "income" as const, label: "Income" },
    { id: "expense" as const, label: "Expense" },
  ];

  return (
    <PageGuard requiredPermission="accounting.*" redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t("chartOfAccounts")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage your chart of accounts in one place
                </p>
              </div>
            </div>
            <Link
              href="/accounting/journal/new"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              {t("newEntry")}
            </Link>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: "Total Accounts",
                value: stats.total,
                icon: FileText,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("asset"),
                value: stats.byType.asset || 0,
                icon: Wallet,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("liability"),
                value: stats.byType.liability || 0,
                icon: Clock,
                tint: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-50",
              },
              {
                label: t("equity"),
                value: stats.byType.equity || 0,
                icon: CheckCircle2,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ring-1 ring-slate-100`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- Toolbar ---------- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search account code or name..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- List ---------- */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {search || filter !== "all" ? "No matching accounts" : "No accounts yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || filter !== "all"
                  ? "Try adjusting your search query or filter."
                  : "Create your first account to get started."}
              </p>
              {!search && filter === "all" && (
                <Link
                  href="/accounting/journal/new"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  {t("newEntry")}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => {
                const typeStyle = getTypeIcon(a.type);
                const TypeIcon = typeStyle.icon;

                return (
                  <Link
                    key={a.id}
                    href={`/accounting/ledger/${a.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5 block"
                  >
                    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* Identity */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/60">
                          {a.code.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                              {a.nameEn}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeStyle.bg} ${typeStyle.color} ${typeStyle.border}`}
                            >
                              <TypeIcon className="h-3 w-3" />
                              <span className="capitalize">{a.type}</span>
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="truncate max-w-[160px] font-mono">
                              {a.code}
                            </span>
                            {a.nameBn && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="truncate max-w-[160px] text-xs lang-bn">{a.nameBn}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/accounting/ledger/${a.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="View account"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="Download account"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ---------- Footer count ---------- */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500">
              <span>
                Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-700">{accounts.length}</span> accounts
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
