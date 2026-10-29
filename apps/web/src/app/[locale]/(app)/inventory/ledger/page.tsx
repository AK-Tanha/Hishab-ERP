"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import type { StockMovement } from "@/lib/inventory-types";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function LedgerPage() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/stock/ledger`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const rows = (data?.data ?? data ?? []) as StockMovement[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("ledger")}</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      {!isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">No movements yet</p>}
      <div className="space-y-2">
        {rows.map((m: StockMovement) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{m.product?.nameEn ?? m.productId}</span>
              <span className={`font-bold ${Number(m.quantity) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {Number(m.quantity) > 0 ? "+" : ""}{m.quantity}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {m.type} · {m.warehouse?.nameEn ?? m.warehouseId} · {new Date(m.createdAt).toLocaleString()}
            </div>
            {m.notes && <p className="mt-1 text-xs">{m.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
