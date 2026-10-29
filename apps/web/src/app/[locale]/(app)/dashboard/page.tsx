"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  FileText,
  Calendar,
  Wallet,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken") || ""
    : "";
}
function getTenant() {
  return typeof window !== "undefined"
    ? localStorage.getItem("tenantId") || ""
    : "";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

/* ---------- component ---------- */

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/reports/dashboard`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });
  const d = (data?.data ?? data ?? {}) as {
    todaysSales?: number;
    receivables?: number;
    payables?: number;
    lowStockCount?: number;
    salesTrend?: { date: string; total: number }[];
  };

  const kpis = [
    {
      label: t("todaysSales"),
      value: formatCurrency((d.todaysSales ?? 0) / 100),
      icon: ShoppingCart,
      tint: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      trend: "+12.5%",
      trendColor: "text-emerald-600",
    },
    {
      label: t("receivables"),
      value: formatCurrency((d.receivables ?? 0) / 100),
      icon: Wallet,
      tint: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      trend: "+4.3%",
      trendColor: "text-emerald-600",
    },
    {
      label: t("payables"),
      value: formatCurrency((d.payables ?? 0) / 100),
      icon: DollarSign,
      tint: "from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: "-2.1%",
      trendColor: "text-rose-600",
    },
    {
      label: t("lowStock"),
      value: String(d.lowStockCount ?? 0),
      icon: AlertTriangle,
      tint: "from-slate-500/10 dark:from-white/10 to-slate-500/5 dark:to-white/5",
      iconColor: "text-slate-600 dark:text-slate-400",
      iconBg: "bg-slate-50 dark:bg-slate-800",
      trend: "Action needed",
      trendColor: "text-amber-600",
    },
  ];

  const trend = (d.salesTrend ?? []).map((x) => ({
    date: x.date.slice(5),
    total: x.total / 100,
  }));

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Overview of your business performance
              </p>
            </div>
          </div>
          <Link
            href="/sales/invoices/new"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            New Invoice
          </Link>
        </div>

        {/* ---------- Stats ---------- */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${k.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                />
                <div className="relative flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {k.label}
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                      {k.value}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${k.trendColor}`}>
                      {k.trend}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.iconBg} ring-1 ring-slate-100 dark:ring-slate-700`}
                  >
                    <Icon className={`h-5 w-5 ${k.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:grid-cols-2 gap-6">
          {/* ---------- Sales trend chart ---------- */}
          <section className="lg:col-span-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5 md:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
            <div className="mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sales Overview
              </h2>
            </div>

            <div className="h-[240px] sm:h-[280px] md:h-[320px]">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{ top: 8, right: 8, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={20}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                          .replace(" ", "-"); // → 21-Feb
                      }}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: "13px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        color: "hsl(var(--popover-foreground))",
                        marginBottom: "4px",
                      }}
                      itemStyle={{
                        color: "hsl(var(--popover-foreground))",
                      }}
                      cursor={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--primary))",
                        r: 3,
                        strokeWidth: 0,
                      }}
                      activeDot={{
                        r: 5,
                        fill: "hsl(var(--primary))",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* ---------- Quick actions ---------- */}
          <section className="lg:col-span-1 rounded-2xl mt-4 border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Quick Actions
              </h2>
            </div>
            <div className="grid gap-3">
              {[
                {
                  label: "New Invoice",
                  href: "/sales/invoices/new",
                  icon: FileText,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  label: "Sales Report",
                  href: "/reports/sales",
                  icon: TrendingUp,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Profit & Loss",
                  href: "/reports/profit-loss",
                  icon: DollarSign,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  label: "Low Stock",
                  href: "/inventory",
                  icon: AlertTriangle,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {action.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Open {action.label}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
