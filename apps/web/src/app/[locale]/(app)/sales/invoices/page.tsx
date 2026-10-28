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
  Download,
  Eye,
  Calendar,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer?: { nameEn: string } | null;
  total: number;
  paidAmount: number;
  status: string;
  date: string;
};

/* ---------- helpers ---------- */

function getInitials(name: string) {
  if (!name) return "W";
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
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
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

export default function InvoicesPage() {
  const t = useTranslations("sales");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "paid" | "partial" | "unpaid">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/sales/invoices`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const invoices = React.useMemo(
    () =>
      ((data?.data ?? data ?? []) as Invoice[]).map((inv) => ({
        ...inv,
        status: (inv.status ?? "draft").toLowerCase(),
      })),
    [data]
  );

  /* derived stats */
  const stats = React.useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "paid").length;
    const totalAmount = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const paidAmount = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const outstanding = totalAmount - paidAmount;
    return { total, paid, totalAmount, paidAmount, outstanding };
  }, [invoices]);

  /* filtered list */
  const filtered = React.useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customer?.nameEn?.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "paid" && inv.status === "paid") ||
        (filter === "partial" && inv.status === "partial") ||
        (filter === "unpaid" && inv.status !== "paid");
      return matchesSearch && matchesFilter;
    });
  }, [invoices, search, filter]);

  const statCards = [
    {
      label: "Total Invoices",
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
    <PageGuard requiredPermission="sales.*" redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t("invoices")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage and track all your invoices in one place
                </p>
              </div>
            </div>
            <Link
              href="/sales/invoices/new"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              {t("newInvoice")}
            </Link>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
<div
  key={stat.label}
  className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group"
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
                placeholder="Search invoice or customer..."
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
                {search || filter !== "all" ? "No matching invoices" : "No invoices yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || filter !== "all"
                  ? "Try adjusting your search query or filter."
                  : "Create your first invoice to start tracking payments."}
              </p>
              {!search && filter === "all" && (
                <Link
                  href="/sales/invoices/new"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  {t("newInvoice")}
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
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5"
                  >
                    {/* Side accent */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} />

                    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* Identity */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/60">
                          {getInitials(inv.customer?.nameEn ?? "Walk-in")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.text} ${status.border}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span className="capitalize">{inv.status}</span>
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="truncate max-w-[160px]">
                              {inv.customer?.nameEn ?? "Walk-in"}
                            </span>
                            <span className="text-slate-300">•</span>
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
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            {t("total")}
                          </p>
                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {formatCurrency(inv.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            {t("paid")}
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-emerald-600">
                            {formatCurrency(inv.paidAmount)}
                          </p>
                        </div>
                        {isPartial && (
                          <div className="hidden sm:block">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
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
                          href={`/sales/invoices/${inv.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="View invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="Download invoice"
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

                    {/* Payment progress bar (partial only) */}
                    {isPartial && (
                      <div className="mt-4 pl-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Payment progress</span>
                          <span className="font-medium text-slate-700">
                            {paymentProgress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500">
              <span>
                Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-700">{invoices.length}</span> invoices
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
