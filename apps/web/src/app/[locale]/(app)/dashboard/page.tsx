"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ShoppingCart, DollarSign, AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    { label: t("todaysSales"), value: ((d.todaysSales ?? 0) / 100).toFixed(2), icon: ShoppingCart, trend: "+12.5%" },
    { label: t("receivables"), value: ((d.receivables ?? 0) / 100).toFixed(2), icon: DollarSign, trend: "+4.3%" },
    { label: t("payables"), value: ((d.payables ?? 0) / 100).toFixed(2), icon: DollarSign, trend: "-2.1%" },
    { label: t("lowStock"), value: d.lowStockCount ?? 0, icon: AlertTriangle, trend: "Action needed" },
  ];

  const trend = (d.salesTrend ?? []).map((x) => ({ date: x.date.slice(5), total: x.total / 100 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>
        <Button asChild>
          <Link href="/sales/new">
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{k.label === t("lowStock") ? k.value : `৳${k.value}`}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {k.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Sales performance over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] animate-pulse rounded bg-muted" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" fontSize={12} className="text-muted-foreground" />
                <YAxis fontSize={12} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/reports/sales">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Sales Report</CardTitle>
                    <CardDescription>View detailed sales analytics</CardDescription>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/reports/profit-loss">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Profit & Loss</CardTitle>
                    <CardDescription>Financial performance summary</CardDescription>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
