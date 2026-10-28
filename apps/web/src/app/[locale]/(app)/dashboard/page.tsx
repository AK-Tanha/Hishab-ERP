"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch(`${API}/api/v1/reports/dashboard`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const d = (data?.data ?? data ?? {}) as { todaysSales?: number; receivables?: number; payables?: number; lowStockCount?: number; salesTrend?: { date: string; total: number }[] };

  const kpis = [
    { label: t("todaysSales"), value: ((d.todaysSales ?? 0) / 100).toFixed(2), icon: ShoppingCart, color: "text-primary" },
    { label: t("receivables"), value: ((d.receivables ?? 0) / 100).toFixed(2), icon: DollarSign, color: "text-amber-600" },
    { label: t("payables"), value: ((d.payables ?? 0) / 100).toFixed(2), icon: DollarSign, color: "text-muted-foreground" },
    { label: t("lowStock"), value: d.lowStockCount ?? 0, icon: AlertTriangle, color: "text-red-600" },
  ];

  const trend = (d.salesTrend ?? []).map((x) => ({ date: x.date.slice(5), total: x.total / 100 }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("todaysSales")}</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <Icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className={`mt-1 text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Sales (last 7 days)</h2>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/reports/sales" className="rounded-xl border border-border bg-card p-4 hover:bg-muted">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="mt-2 font-medium">Sales report</p>
        </Link>
        <Link href="/reports/profit-loss" className="rounded-xl border border-border bg-card p-4 hover:bg-muted">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="mt-2 font-medium">Profit &amp; Loss</p>
        </Link>
      </div>
    </div>
  );
}
