"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  MoreHorizontal,
  Wallet,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type SaleInvoice = {
  id: string;
  invoiceNumber: string;
  total: number;
  date: string;
  customer?: { nameEn: string } | null;
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

export default function SalesReportPage() {
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [search, setSearch] = React.useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sales-report", from, to, search],
    queryFn: () =>
      apiFetch(
        `${API}/api/v1/reports/sales?from=${from}&to=${to}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "X-Tenant-ID": getTenant(),
          },
        }
      ),
  });

  const r = React.useMemo(() => (data?.data ?? data ?? {
    invoices: [],
    totalSales: 0,
    totalPaid: 0,
    totalDue: 0,
    count: 0,
  }) as {
    invoices: SaleInvoice[];
    totalSales: number;
    totalPaid: number;
    totalDue: number;
    count: number;
  }, [data]);
  const invoices = React.useMemo(() => r.invoices ?? [], [r]);

  const filtered = React.useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer?.nameEn?.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [invoices, search]);

  const stats = React.useMemo(() => {
    return {
      total: invoices.length,
      totalSales: r.totalSales || 0,
      totalPaid: r.totalPaid || 0,
      totalDue: r.totalDue || 0,
    };
  }, [invoices, r]);

  return (
    <PageGuard requiredPermission="reports.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to reports"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  Sales Report
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Track sales performance over time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/reports/sales`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Download report"
              >
                <Download className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: "Invoices",
                value: stats.total,
                icon: FileText,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: "Total Sales",
                value: formatCurrency(stats.totalSales),
                icon: TrendingUp,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: "Collected",
                value: formatCurrency(stats.totalPaid),
                icon: Wallet,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Outstanding",
                value: formatCurrency(stats.totalDue),
                icon: AlertCircle,
                tint: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-50",
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

          {/* ---------- Toolbar ---------- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto lg:w-72">
              <div className="relative flex-1">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="From"
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto lg:w-72">
              <div className="relative flex-1">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="To"
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or customer..."
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors placeholder:text-slate-400 placeholder:dark:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99]"
            >
              <ArrowUpRight className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* ---------- List ---------- */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                {search || from || to ? "No matching invoices" : "No sales yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {search || from || to
                  ? "Try adjusting your search query or date filter."
                  : "No sales invoices to report."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => (
                <div
                  key={inv.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5"
                >
                  <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                        {inv.invoiceNumber.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[160px]">
                            {inv.customer?.nameEn ?? "Walk-in"}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(inv.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-center gap-6 sm:gap-8">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Total
                        </p>
                        <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(inv.total)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/sales/invoices/${inv.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                        aria-label="View invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                        aria-label="Download invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- Footer count ---------- */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">{invoices.length}</span> invoices
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
