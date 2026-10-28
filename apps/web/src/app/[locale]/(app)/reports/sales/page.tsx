"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function SalesReportPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const { data, refetch } = useQuery({
    queryKey: ["sales-report", from, to],
    queryFn: () => apiFetch(`${API}/api/v1/reports/sales?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const r = (data?.data ?? data ?? { invoices: [], totalSales: 0, totalPaid: 0, totalDue: 0, count: 0 }) as { invoices: { id: string; invoiceNumber: string; total: number; date: string; customer?: { nameEn: string } | null }[]; totalSales: number; totalPaid: number; totalDue: number; count: number };
  const invoices = r.invoices ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Sales report</h1>
      </div>
      <div className="flex gap-2">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <button onClick={() => refetch()} className="flex h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Filter</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Total sales</p>
          <p className="text-lg font-bold">{(r.totalSales / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-lg font-bold">{(r.totalPaid / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Due</p>
          <p className="text-lg font-bold">{(r.totalDue / 100).toFixed(2)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {invoices.map((inv: { id: string; invoiceNumber: string; total: number; date: string; customer?: { nameEn: string } | null }) => (
          <div key={inv.id} className="rounded-xl border border-border bg-card p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{inv.invoiceNumber}</span>
              <span>{(inv.total / 100).toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground">{inv.date} · {inv.customer?.nameEn ?? "Walk-in"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
