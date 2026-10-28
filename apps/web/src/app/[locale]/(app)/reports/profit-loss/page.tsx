"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function ProfitLossPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const { data, refetch } = useQuery({
    queryKey: ["profit-loss", from, to],
    queryFn: () => apiFetch(`${API}/api/v1/reports/profit-loss?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const r = (data?.data ?? data ?? { revenue: 0, expenses: 0, profit: 0 }) as { revenue: number; expenses: number; profit: number };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Profit &amp; Loss</h1>
      </div>
      <div className="flex gap-2">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <button onClick={() => refetch()} className="flex h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Filter</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <span className="font-medium">Revenue</span>
          <span className="font-bold text-green-600">{(r.revenue / 100).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <span className="font-medium">Expenses</span>
          <span className="font-bold text-red-600">{(r.expenses / 100).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <span className="font-medium">Profit</span>
          <span className={`font-bold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{(r.profit / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
