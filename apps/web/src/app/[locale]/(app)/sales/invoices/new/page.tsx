"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Warehouse,
  Calendar,
  Wallet,
  Loader2,
  AlertCircle,
  X,
  FileText,
  ShoppingCart,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

interface Line {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
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

export default function NewInvoicePage() {
  const t = useTranslations("sales");
  const router = useRouter();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/inventory/products`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });
  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/sales/customers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });
  const warehousesQuery = useQuery({
    queryKey: ["warehouses"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/inventory/warehouses`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const prods = (productsQuery.data?.data ?? productsQuery.data ?? []) as {
    id: string;
    nameEn: string;
    sellingPrice: number;
  }[];
  const custs = (customersQuery.data?.data ?? customersQuery.data ?? []) as {
    id: string;
    nameEn: string;
  }[];
  const whs = (warehousesQuery.data?.data ?? warehousesQuery.data ?? []) as {
    id: string;
    nameEn: string;
  }[];

  const [customerId, setCustomerId] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [lines, setLines] = React.useState<Line[]>([
    { productId: "", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`${API}/api/v1/sales/invoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => router.push("/sales/invoices"),
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to create invoice";
      setSubmitError(msg);
    },
  });

  /* derived */
  const total = lines.reduce(
    (s, l) => s + (l.quantity || 0) * (l.unitPrice || 0),
    0
  );
  const balance = total - (paidAmount || 0);
  const isFullyPaid = balance <= 0.001 && total > 0;
  const isPartial = !isFullyPaid && paidAmount > 0;
  const validLines = lines.filter(
    (l) => l.productId || l.description || l.quantity > 0
  );
  const canSubmit =
    !!warehouseId && validLines.length > 0 && !mutation.isPending;

  const updateLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const onProductChange = (idx: number, productId: string) => {
    const p = prods.find((x) => x.id === productId);
    if (p) {
      updateLine(idx, {
        productId,
        description: p.nameEn,
        unitPrice: p.sellingPrice / 100,
      });
    } else {
      updateLine(idx, { productId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    mutation.mutate({
      customerId: customerId || null,
      warehouseId,
      date,
      paidAmount: Math.round((paidAmount || 0) * 100),
      items: lines
        .filter((l) => l.productId || l.description || l.quantity > 0)
        .map((l) => ({
          productId: l.productId || null,
          description: l.description || "Item",
          quantity: l.quantity || 1,
          unitPrice: Math.round((l.unitPrice || 0) * 100),
        })),
    });
  };

  /* loading state */
  if (
    productsQuery.isLoading ||
    customersQuery.isLoading ||
    warehousesQuery.isLoading
  ) {
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
                  {t("newInvoice")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Create a new invoice with line items and payment
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
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-pulse">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Line Items
                    </h2>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1.6rem_1.6fr_0.7fr_0.9fr_1.2fr_0.9fr_2.5rem] gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:items-center sm:p-2"
                    >
                      <div className="h-6 w-6 rounded-md bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-6 w-24 rounded-md bg-slate-100" />
                    </div>
                  ))}
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
                  <div className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium border-slate-200 bg-slate-50 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="h-3 w-20 rounded-full bg-slate-200" />
                  </div>
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
                {t("newInvoice")}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Create a new invoice with line items and payment
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
            {/* Invoice details */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Invoice Details
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("customer")}>
                  <Select
                    value={customerId}
                    onChange={setCustomerId}
                    icon={User}
                    loading={customersQuery.isLoading}
                    placeholder="Walk-in customer"
                  >
                    {custs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Warehouse" required>
                  <Select
                    value={warehouseId}
                    onChange={setWarehouseId}
                    icon={Warehouse}
                    loading={warehousesQuery.isLoading}
                    placeholder="Select warehouse"
                    required
                  >
                    {whs.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameEn}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t("date")}>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
                <Field label={t("paid")} hint="Amount already paid by customer">
                  <div className="relative">
                    <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Line items */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Line Items
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {lines.length} item{lines.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Column header (desktop) */}
              <div className="hidden grid-cols-[1.6rem_1.6fr_0.7fr_0.9fr_1.2fr_0.9fr_2.5rem] gap-2 px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
                <div>#</div>
                <div>Product</div>
                <div>Qty</div>
                <div>Price</div>
                <div>Description</div>
                <div className="text-right">Subtotal</div>
                <div />
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => {
                  const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 transition-colors hover:border-slate-300 sm:grid-cols-[1.6rem_1.6fr_0.7fr_0.9fr_1.2fr_0.9fr_2.5rem] sm:items-center sm:bg-transparent sm:p-2 sm:hover:bg-slate-50/60"
                    >
                      {/* Number */}
                      <div className="flex items-center justify-between sm:block">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                          Item {idx + 1}
                        </span>
                      </div>

                      {/* Product */}
                      <Select
                        value={line.productId}
                        onChange={(v) => onProductChange(idx, v)}
                        loading={productsQuery.isLoading}
                        placeholder="— select product —"
                      >
                        {prods.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameEn}
                          </option>
                        ))}
                      </Select>

                      {/* Qty */}
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(idx, { quantity: Number(e.target.value) })
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />

                      {/* Price */}
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="Price"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(idx, { unitPrice: Number(e.target.value) })
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-6 pr-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Description */}
                      <input
                        placeholder={t("description")}
                        value={line.description}
                        onChange={(e) =>
                          updateLine(idx, { description: e.target.value })
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />

                      {/* Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                          Subtotal
                        </span>
                        <span className="text-sm font-semibold text-slate-900 sm:text-right">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          setLines(lines.filter((_, i) => i !== idx))
                        }
                        disabled={lines.length === 1}
                        className="flex h-9 w-9 items-center justify-center self-end justify-self-end rounded-lg border border-transparent text-rose-500 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30 sm:mx-auto"
                        aria-label="Remove line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add line */}
              <button
                type="button"
                onClick={() =>
                  setLines([
                    ...lines,
                    { productId: "", description: "", quantity: 1, unitPrice: 0 },
                  ])
                }
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <Plus className="h-4 w-4" />
                Add line item
              </button>
            </section>
          </div>

          {/* ---------- Summary sidebar ---------- */}
          <aside className="lg:col-span-1">
<div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6 group relative overflow-hidden">
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-paid to-due" />
  <div className="flex items-center gap-2">
    <FileText className="h-4 w-4 text-slate-400" />
    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      Summary
    </h2>
  </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Paid</span>
                  <span className="font-semibold text-emerald-600">
                    -{formatCurrency(paidAmount || 0)}
                  </span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Balance due
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isFullyPaid
                        ? "text-emerald-600"
                        : isPartial
                        ? "text-amber-600"
                        : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(Math.max(0, balance))}
                  </span>
                </div>

                {/* Status pill */}
                <div className="flex justify-center pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                      isFullyPaid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isPartial
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isFullyPaid
                          ? "bg-emerald-500"
                          : isPartial
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {isFullyPaid
                      ? "Fully paid"
                      : isPartial
                      ? "Partial payment"
                      : "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Validation hint */}
              {!warehouseId && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Warehouse is required to save the invoice.</span>
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
                    Save invoice
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