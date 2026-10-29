"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { PageGuard } from "@/lib/page-guard";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";

const items = [
  { href: "/reports/sales", label: "Sales report", icon: TrendingUp },
  { href: "/reports/stock", label: "Stock report", icon: Package },
  { href: "/reports/receivables", label: "Receivables", icon: Users },
  { href: "/reports/payables", label: "Payables", icon: DollarSign },
  { href: "/reports/profit-loss", label: "Profit & Loss", icon: BarChart3 },
];

export default function ReportsPage() {
  return (
    <PageGuard requiredPermission="reports.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  Reports
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  View and analyze your business reports
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/reports/sales"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              >
                <TrendingUp className="h-4 w-4" />
                Sales report
              </Link>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: "Sales Report", icon: TrendingUp, tint: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600", iconBg: "bg-blue-50" },
              { label: "Stock Report", icon: Package, tint: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
              { label: "Receivables", icon: Users, tint: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-600", iconBg: "bg-violet-50" },
              { label: "Payables", icon: DollarSign, tint: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600", iconBg: "bg-amber-50" },
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

          {/* ---------- Reports list ---------- */}
          <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                All Reports
              </h2>
            </div>
            <div className="space-y-2">
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {it.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">View report details</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </PageGuard>
  );
}
