"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function PayablesPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: () => apiFetch(`${API}/api/v1/reports/payables`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const rows = (data?.data ?? data ?? []) as { billNumber: string; supplier: string; date: string; total: number; paid: number; due: number }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Payables</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{r.billNumber} · {r.supplier}</span>
              <span className="font-bold text-red-600">{(r.due / 100).toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground">Total {(r.total / 100).toFixed(2)} · Paid {(r.paid / 100).toFixed(2)}</div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No outstanding payables</p>}
      </div>
    </div>
  );
}
