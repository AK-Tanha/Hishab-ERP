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
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Search,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Payable = {
  id: string;
  billNumber: string;
  supplier: string;
  date: string;
  total: number;
  paid: number;
  due: number;
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

function getStatusStyle(due: number, paid: number) {
  if (due > 0 && paid > 0) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      dot: "bg-amber-500",
      label: "Partial",
    };
  }
  if (due > 0) {
    return {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: AlertCircle,
      dot: "bg-rose-500",
      label: "Overdue",
    };
  }
  return {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    label: "Paid",
  };
}

/* ---------- component ---------- */

export default function PayablesPage() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/reports/payables`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const rows = React.useMemo(
    () => ((data?.data ?? data ?? []) as Payable[]),
    [data]
  );

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.billNumber.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [rows, search]);

  const stats = React.useMemo(() => {
    const totalDue = rows.reduce((s, r) => s + (r.due || 0), 0);
    const totalAmount = rows.reduce((s, r) => s + (r.total || 0), 0);
    const totalPaid = rows.reduce((s, r) => s + (r.paid || 0), 0);
    return { total: rows.length, totalDue, totalAmount, totalPaid };
  }, [rows]);

  return (
    <PageGuard requiredPermission="reports.*" redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Back to reports"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Payables
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Track outstanding supplier bills
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/reports/payables`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
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
                label: "Bills",
                value: stats.total,
                icon: FileText,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: "Total Amount",
                value: formatCurrency(stats.totalAmount),
                icon: TrendingUp,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: "Paid",
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
                placeholder="Search bill or supplier..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
                {search ? "No matching bills" : "No outstanding payables"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try adjusting your search query."
                  : "All supplier bills are paid up to date."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const status = getStatusStyle(r.due, r.paid);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={r.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5"
                  >
                    {/* Side accent */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} />

                    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* Identity */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/60">
                          {r.supplier.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                              {r.billNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.text} ${status.border}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span className="capitalize">{status.label}</span>
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="truncate max-w-[160px]">
                              {r.supplier}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(r.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="flex items-center gap-6 sm:gap-8">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </p>
                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {formatCurrency(r.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Paid
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-emerald-600">
                            {formatCurrency(r.paid)}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Due
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-amber-600">
                            {formatCurrency(r.due)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/purchases/bills/${r.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="View bill"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-label="Download bill"
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
                <span className="font-medium text-slate-700">{rows.length}</span> bills
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
