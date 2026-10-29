"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  FileText,
  Wallet,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((value || 0) / 100);
}

/* ---------- component ---------- */

export default function ProfitLossPage() {
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const { data, refetch } = useQuery({
    queryKey: ["profit-loss", from, to],
    queryFn: () =>
      apiFetch(`${API}/api/v1/reports/profit-loss?from=${from}&to=${to}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const r = (data?.data ?? data ?? { revenue: 0, expenses: 0, profit: 0 }) as {
    revenue: number;
    expenses: number;
    profit: number;
  };

  return (
    <PageGuard requiredPermission="reports.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
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
                  Profit & Loss
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Track revenue, expenses and profit over time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/reports/profit-loss`}
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
                label: "Revenue",
                value: formatCurrency(r.revenue),
                icon: TrendingUp,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Expenses",
                value: formatCurrency(r.expenses),
                icon: Wallet,
                tint: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-50",
              },
              {
                label: "Profit",
                value: formatCurrency(r.profit),
                icon: AlertCircle,
                tint:
                  r.profit >= 0
                    ? "from-emerald-500/10 to-emerald-500/5"
                    : "from-rose-500/10 to-rose-500/5",
                iconColor: r.profit >= 0 ? "text-emerald-600" : "text-rose-600",
                iconBg: r.profit >= 0 ? "bg-emerald-50" : "bg-rose-50",
              },
              {
                label: "Margin",
                value:
                  r.revenue > 0
                    ? ((r.profit / r.revenue) * 100).toFixed(1) + "%"
                    : "0%",
                icon: FileText,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
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
            <button
              onClick={() => refetch()}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99]"
            >
              <ArrowUpRight className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* ---------- Summary ---------- */}
          <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Revenue</span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(r.revenue)}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Expenses</span>
                <span className="text-sm font-bold text-amber-600">
                  {formatCurrency(r.expenses)}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-sm text-slate-600 dark:text-slate-400">Profit</span>
                <span className={`text-lg font-bold ${
                  r.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {formatCurrency(r.profit)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageGuard>
  );
}
