"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

interface Line { productId: string; description: string; quantity: number; unitCost: number; }

export default function NewBillPage() {
  const t = useTranslations("purchases");
  const router = useRouter();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => apiFetch(`${API}/api/v1/inventory/products`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }) });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: () => apiFetch(`${API}/api/v1/purchases/suppliers`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }) });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: () => apiFetch(`${API}/api/v1/inventory/warehouses`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }) });

  const prods = (products?.data ?? products ?? []) as { id: string; nameEn: string; costPrice: number }[];
  const sups = (suppliers?.data ?? suppliers ?? []) as { id: string; nameEn: string }[];
  const whs = (warehouses?.data ?? warehouses ?? []) as { id: string; nameEn: string }[];

  const [supplierId, setSupplierId] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [lines, setLines] = React.useState<Line[]>([{ productId: "", description: "", quantity: 1, unitCost: 0 }]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiFetch(`${API}/api/v1/purchases/bills`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
      body: JSON.stringify(payload),
    }),
    onSuccess: () => router.push("/purchases/bills"),
  });

  const total = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      supplierId: supplierId || null,
      warehouseId,
      date,
      paidAmount: Math.round(paidAmount * 100),
      items: lines.map((l) => ({ productId: l.productId || null, description: l.description || "Item", quantity: l.quantity, unitCost: Math.round(l.unitCost * 100) })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("newBill")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("supplier")}</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {sups.map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Warehouse</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" required>
              <option value="">—</option>
              {whs.map((w) => <option key={w.id} value={w.id}>{w.nameEn}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Paid</label>
            <input type="number" step="any" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-4 rounded-lg border border-border bg-card p-3">
              <select value={line.productId} onChange={(e) => { const n = [...lines]; n[idx].productId = e.target.value; const p = prods.find((x) => x.id === e.target.value); if (p) { n[idx].description = p.nameEn; n[idx].unitCost = p.costPrice / 100; } setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option value="">— product —</option>
                {prods.map((p) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
              </select>
              <input type="number" step="any" placeholder="Qty" value={line.quantity} onChange={(e) => { const n = [...lines]; n[idx].quantity = Number(e.target.value); setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
              <input type="number" step="any" placeholder="Cost" value={line.unitCost} onChange={(e) => { const n = [...lines]; n[idx].unitCost = Number(e.target.value); setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
              <div className="flex gap-2">
                <input placeholder="Description" value={line.description} onChange={(e) => { const n = [...lines]; n[idx].description = e.target.value; setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
                <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setLines([...lines, { productId: "", description: "", quantity: 1, unitCost: 0 }])} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm hover:bg-muted">
            <Plus className="h-4 w-4" /> Add line
          </button>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm font-medium">Total: {total.toFixed(2)}</div>

        <button type="submit" disabled={mutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
        {mutation.isError && <p className="text-sm text-destructive">Failed to create bill</p>}
      </form>
    </div>
  );
}
