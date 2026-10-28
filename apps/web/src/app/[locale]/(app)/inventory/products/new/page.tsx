"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import type { Category, Unit } from "@/lib/inventory-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function NewProductPage() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [form, setForm] = React.useState({
    sku: "", nameEn: "", nameBn: "", categoryId: "", unitId: "",
    costPrice: 0, sellingPrice: 0, reorderLevel: 0, descriptionEn: "", descriptionBn: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/categories`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/units`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiFetch(`${API}/api/v1/inventory/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
      body: JSON.stringify(payload),
    }),
    onSuccess: () => router.push("/inventory"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      costPrice: Math.round(form.costPrice * 100),
      sellingPrice: Math.round(form.sellingPrice * 100),
      reorderLevel: form.reorderLevel,
      categoryId: form.categoryId || null,
      unitId: form.unitId || null,
    });
  };

  const cats = (categories?.data ?? categories ?? []) as Category[];
  const uns = (units?.data ?? units ?? []) as Unit[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("newProduct")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("sku")} value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} required />
          <Field label={`${t("name")} (EN)`} value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} required />
          <Field label={`${t("name")} (BN)`} value={form.nameBn} onChange={(v) => setForm({ ...form, nameBn: v })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("category")}</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {cats.map((c: Category) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("unit")}</label>
            <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {uns.map((u: Unit) => <option key={u.id} value={u.id}>{u.nameEn}</option>)}
            </select>
          </div>
          <Field label={t("costPrice")} type="number" value={form.costPrice} onChange={(v) => setForm({ ...form, costPrice: Number(v) })} />
          <Field label={t("sellingPrice")} type="number" value={form.sellingPrice} onChange={(v) => setForm({ ...form, sellingPrice: Number(v) })} />
          <Field label={t("reorderLevel")} type="number" value={form.reorderLevel} onChange={(v) => setForm({ ...form, reorderLevel: Number(v) })} />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
        {mutation.isError && <p className="text-sm text-destructive">Failed to create product</p>}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        inputMode={type === "number" ? "decimal" : "text"}
        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
