"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import type { Product, Warehouse } from "@/lib/inventory-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function AdjustStockPage() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [form, setForm] = React.useState({ productId: "", warehouseId: "", type: "in" as "in" | "out" | "adjustment", quantity: 1, notes: "" });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/products`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/warehouses`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiFetch(`${API}/api/v1/inventory/stock/adjust`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
      body: JSON.stringify(payload),
    }),
    onSuccess: () => router.push("/inventory"),
  });

  const prods = (products?.data ?? products ?? []) as Product[];
  const whs = (warehouses?.data ?? warehouses ?? []) as Warehouse[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("adjustStock")}</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("product")}</label>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" required>
            <option value="">—</option>
            {prods.map((p: Product) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("warehouse")}</label>
          <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" required>
            <option value="">—</option>
            {whs.map((w: Warehouse) => <option key={w.id} value={w.id}>{w.nameEn}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("adjustment")}</label>
          <div className="flex gap-2">
            {(["in", "out", "adjustment"] as const).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setForm({ ...form, type: ty })}
                className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${form.type === ty ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
              >
                {ty === "in" ? t("stockIn") : ty === "out" ? t("stockOut") : t("adjustment")}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("quantity")}</label>
          <input type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required inputMode="decimal" className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={mutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
        {mutation.isError && <p className="text-sm text-destructive">Failed to adjust stock</p>}
      </form>
    </div>
  );
}
