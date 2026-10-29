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
  Calendar,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
  Truck,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Bill = {
  id: string;
  billNumber: string;
  supplier?: { nameEn: string } | null;
  total: number;
  paidAmount: number;
  status: string;
  date: string;
};

/* ---------- helpers ---------- */

function getInitials(name: string) {
  if (!name) return "V";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle2,
        dot: "bg-emerald-500",
        ring: "ring-emerald-500/20",
      };
    case "partial":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
        dot: "bg-amber-500",
        ring: "ring-amber-500/20",
      };
    case "overdue":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: AlertCircle,
        dot: "bg-rose-500",
        ring: "ring-rose-500/20",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-800",
        icon: FileText,
        dot: "bg-slate-400",
        ring: "ring-slate-400/20",
      };
  }
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((cents || 0) / 100);
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

export default function BillsPage() {
  const t = useTranslations("purchases");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "paid" | "partial" | "unpaid">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/purchases/bills`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const bills = React.useMemo(
    () =>
      ((data?.data ?? data ?? []) as Bill[]).map((inv) => ({
        ...inv,
        status: (inv.status ?? "draft").toLowerCase(),
      })),
    [data]
  );

  /* derived stats */
  const stats = React.useMemo(() => {
    const total = bills.length;
    const paid = bills.filter((i) => i.status === "paid").length;
    const totalAmount = bills.reduce((s, i) => s + (i.total || 0), 0);
    const paidAmount = bills.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const outstanding = totalAmount - paidAmount;
    return { total, paid, totalAmount, paidAmount, outstanding };
  }, [bills]);

  /* filtered list */
  const filtered = React.useMemo(() => {
    return bills.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inv.billNumber?.toLowerCase().includes(q) ||
        inv.supplier?.nameEn?.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "paid" && inv.status === "paid") ||
        (filter === "partial" && inv.status === "partial") ||
        (filter === "unpaid" && inv.status !== "paid");
      return matchesSearch && matchesFilter;
    });
  }, [bills, search, filter]);

  const statCards = [
    {
      label: "Total Bills",
      value: stats.total,
      icon: Receipt,
      tint: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Paid",
      value: stats.paid,
      icon: CheckCircle2,
      tint: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Collected",
      value: formatCurrency(stats.paidAmount),
      icon: Wallet,
      tint: "from-violet-500/10 to-violet-500/5",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      label: "Outstanding",
      value: formatCurrency(stats.outstanding),
      icon: TrendingUp,
      tint: "from-amber-500/10 to-amber-500/5",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  const filterTabs = [
    { id: "all" as const, label: "All" },
    { id: "paid" as const, label: "Paid" },
    { id: "partial" as const, label: "Partial" },
    { id: "unpaid" as const, label: "Unpaid" },
  ];

  return (
    <PageGuard requiredPermission="purchases.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {t("bills")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Manage and track all your purchase bills in one place
                </p>
              </div>
            </div>
            <Link
              href="/purchases/bills/new"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              {t("newBill")}
            </Link>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statCards.map((stat) => {
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
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bill or supplier..."
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors placeholder:text-slate-400 placeholder:dark:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:dark:bg-slate-800"
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
                {search || filter !== "all" ? "No matching bills" : "No bills yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {search || filter !== "all"
                  ? "Try adjusting your search query or filter."
                  : "Create your first bill to start tracking purchases."}
              </p>
              {!search && filter === "all" && (
                <Link
                  href="/purchases/bills/new"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  {t("newBill")}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => {
                const status = getStatusStyle(inv.status);
                const StatusIcon = status.icon;
                const paymentProgress =
                  inv.total > 0 ? Math.min(100, (inv.paidAmount / inv.total) * 100) : 0;
                const isPartial = inv.status === "partial";
                const remaining = inv.total - inv.paidAmount;

                return (
                  <div
                    key={inv.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5"
                  >
                    {/* Side accent */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} />

                    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* Identity */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                          {getInitials(inv.supplier?.nameEn ?? "Vendor")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {inv.billNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.text} ${status.border}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span className="capitalize">{inv.status}</span>
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="truncate max-w-[160px]">
                              {inv.supplier?.nameEn ?? "Vendor"}
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
                            {t("total")}
                          </p>
                          <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(inv.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t("paid")}
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-emerald-600">
                            {formatCurrency(inv.paidAmount)}
                          </p>
                        </div>
                        {isPartial && (
                          <div className="hidden sm:block">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                              Due
                            </p>
                            <p className="mt-0.5 text-base font-semibold text-amber-600">
                              {formatCurrency(remaining)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/purchases/bills/${inv.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                          aria-label="View bill"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                          aria-label="Download bill"
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

                    {/* Payment progress bar (partial only) */}
                    {isPartial && (
                      <div className="mt-4 pl-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Payment progress</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {paymentProgress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------- Footer count ---------- */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">{bills.length}</span> bills
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
