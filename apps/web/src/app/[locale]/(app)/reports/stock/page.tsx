"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function StockReportPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["stock-report"],
    queryFn: () => apiFetch(`${API}/api/v1/reports/stock`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const rows = (data?.data ?? data ?? []) as { product: { nameEn: string; sku: string }; stock: number; value: number }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Stock report</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
            <div>
              <p className="font-medium">{r.product.nameEn}</p>
              <p className="text-xs text-muted-foreground">SKU: {r.product.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{r.stock}</p>
              <p className="text-xs text-muted-foreground">{(r.value / 100).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
