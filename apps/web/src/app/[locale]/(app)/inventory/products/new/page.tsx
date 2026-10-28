"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Package,
  Box,
} from "lucide-react";
import type { Category, Unit } from "@/lib/inventory-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

interface ProductForm {
  sku: string;
  nameEn: string;
  nameBn: string;
  categoryId: string;
  unitId: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  descriptionEn: string;
  descriptionBn: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

/* ---------- reusable bits ---------- */

function Field({
  label,
  htmlFor,
  children,
  hint,
  required,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
  placeholder,
  icon: Icon,
  loading,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  icon?: React.ElementType;
  loading?: boolean;
  required?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white ${
          Icon ? "pl-9" : "pl-3"
        } pr-9 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
      ) : (
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </div>
  );
}

/* ---------- main component ---------- */

export default function NewProductPage() {
  const t = useTranslations("inventory");
  const router = useRouter();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/inventory/categories`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });
  const unitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/inventory/units`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`${API}/api/v1/inventory/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => router.push("/inventory"),
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to create product";
      setSubmitError(msg);
    },
  });

  const [form, setForm] = React.useState<ProductForm>({
    sku: "",
    nameEn: "",
    nameBn: "",
    categoryId: "",
    unitId: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0,
    descriptionEn: "",
    descriptionBn: "",
  });
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const cats = (categoriesQuery.data?.data ?? categoriesQuery.data ?? []) as Category[];
  const uns = (unitsQuery.data?.data ?? unitsQuery.data ?? []) as Unit[];

  /* derived */
  const margin = form.sellingPrice - form.costPrice;
  const marginPercent =
    form.sellingPrice > 0 ? (margin / form.sellingPrice) * 100 : 0;
  const canSubmit =
    !!form.sku && !!form.nameEn && !!form.categoryId && !!form.unitId && !mutation.isPending;

  const updateField = (key: keyof ProductForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    mutation.mutate({
      ...form,
      costPrice: Math.round(form.costPrice * 100),
      sellingPrice: Math.round(form.sellingPrice * 100),
      reorderLevel: form.reorderLevel,
      categoryId: form.categoryId || null,
      unitId: form.unitId || null,
    });
  };

  /* loading state */
  if (categoriesQuery.isLoading || unitsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t("newProduct")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Add a new product to your inventory
                </p>
              </div>
            </div>
          </div>
          <form className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-pulse">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                </div>
              </section>
            </div>
            <aside className="lg:col-span-1">
              <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 w-32 rounded-md bg-slate-100" />
                  <div className="h-4 w-24 rounded-md bg-slate-100" />
                  <div className="h-px bg-slate-200" />
                  <div className="h-10 w-24 rounded-md bg-slate-100" />
                  <div className="h-10 w-24 rounded-md bg-slate-100" />
                </div>
                <div className="h-px bg-slate-200" />
                <div className="h-10 w-full rounded-xl bg-slate-100" />
                <div className="h-10 w-full rounded-xl bg-slate-100" />
              </div>
            </aside>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t("newProduct")}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Add a new product to your inventory
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Draft
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* ---------- Main column ---------- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product details */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Product Details
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("sku")} required>
                  <input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                    placeholder="SKU"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label={`${t("name")} (EN)`} required>
                  <input
                    id="nameEn"
                    value={form.nameEn}
                    onChange={(e) => updateField("nameEn", e.target.value)}
                    placeholder="Product name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label={`${t("name")} (BN)`}>
                  <input
                    id="nameBn"
                    value={form.nameBn}
                    onChange={(e) => updateField("nameBn", e.target.value)}
                    placeholder="পণ্যের নাম"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label={t("category")} required>
                  <Select
                    value={form.categoryId}
                    onChange={(v) => updateField("categoryId", v)}
                    placeholder="Select category"
                    loading={categoriesQuery.isLoading}
                    required
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t("unit")} required>
                  <Select
                    value={form.unitId}
                    onChange={(v) => updateField("unitId", v)}
                    placeholder="Select unit"
                    loading={unitsQuery.isLoading}
                    required
                  >
                    {uns.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t("costPrice")} hint="Purchase price per unit">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <input
                      id="costPrice"
                      type="number"
                      step="any"
                      min="0"
                      value={form.costPrice}
                      onChange={(e) => updateField("costPrice", Number(e.target.value))}
                      inputMode="decimal"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
                <Field label={t("sellingPrice")} hint="Sale price per unit">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <input
                      id="sellingPrice"
                      type="number"
                      step="any"
                      min="0"
                      value={form.sellingPrice}
                      onChange={(e) => updateField("sellingPrice", Number(e.target.value))}
                      inputMode="decimal"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Stock settings */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60">
              <div className="mb-4 flex items-center gap-2">
                <Box className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Stock Settings
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("reorderLevel")} hint="Minimum stock before reorder">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      #
                    </span>
                    <input
                      id="reorderLevel"
                      type="number"
                      step="any"
                      min="0"
                      value={form.reorderLevel}
                      onChange={(e) => updateField("reorderLevel", Number(e.target.value))}
                      inputMode="decimal"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
              </div>
            </section>
          </div>

          {/* ---------- Summary sidebar ---------- */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Summary
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Cost price</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(form.costPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Selling price</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(form.sellingPrice)}
                  </span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Margin
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      margin >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(margin)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Margin %
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      margin >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {marginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Validation hint */}
              {(form.sku === "" || form.nameEn === "" || form.categoryId === "" || form.unitId === "") && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>SKU, name, category and unit are required.</span>
                </div>
              )}

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
