"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  AlertTriangle,
  Box,
  Warehouse,
  TrendingUp,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Product = {
  id: string;
  tenantId: string;
  sku: string;
  nameEn: string;
  nameBn: string | null;
  categoryId: string | null;
  categoryNameEn?: string | null;
  unitId: string | null;
  unitName?: string | null;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: string;
  currentStock: string;
  hasVariants: boolean;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/* ---------- component ---------- */

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const t = useTranslations("inventory");
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/products/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
    }),
    enabled: !!id,
  });

  const product = (data?.data ?? data ?? null) as Product | null;

  if (isLoading || !product) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/inventory"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t("product")}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Product details and stock summary
              </p>
            </div>
          </div>
          <div className="space-y-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </section>
            <aside className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  const stockNumber = Number(product.currentStock ?? 0);
  const reorderNumber = Number(product.reorderLevel ?? 0);
  const isLowStock = stockNumber <= reorderNumber;
  const margin = product.sellingPrice - product.costPrice;
  const marginPercent =
    product.sellingPrice > 0 ? (margin / product.sellingPrice) * 100 : 0;
  const stockValue = stockNumber * product.costPrice;

  return (
    <PageGuard requiredPermission="inventory.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/inventory"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to products"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {product.nameEn}
                </h1>
                {product.nameBn && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 lang-bn">
                    {product.nameBn}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/inventory/products/${id}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => {
                  if (
                    window.confirm(t("deleteConfirm") || "Delete this product?")
                  ) {
                    fetch(
                      `${API}/api/v1/inventory/products/${id}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${getToken()}`,
                          "X-Tenant-ID": getTenant(),
                        },
                      }
                    )
                      .then(() => router.push("/inventory"))
                      .then(() => window.location.reload());
                  }
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: t("sku"),
                value: product.sku,
                icon: Box,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("costPrice"),
                value: formatCurrency(product.costPrice),
                icon: DollarSign,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: t("sellingPrice"),
                value: formatCurrency(product.sellingPrice),
                icon: DollarSign,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: "Margin",
                value: `${marginPercent.toFixed(0)}%`,
                icon: TrendingUp,
                tint: margin >= 0
                  ? "from-emerald-500/10 to-emerald-500/5"
                  : "from-rose-500/10 to-rose-500/5",
                iconColor: margin >= 0 ? "text-emerald-600" : "text-rose-600",
                iconBg: margin >= 0 ? "bg-emerald-50" : "bg-rose-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ring-1 ring-slate-100 dark:ring-slate-700`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:grid-cols-3 gap-6">
            {/* ---------- Main column ---------- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Overview
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                      {product.sku.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {product.sku}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">SKU</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                      {product.categoryNameEn
                        ? product.categoryNameEn.charAt(0)
                        : "C"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {product.categoryNameEn ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                      {product.unitName ? product.unitName.charAt(0) : "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {product.unitName ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{t("warehouse")}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stock location</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
                <div className="mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Pricing
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("costPrice")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.costPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("sellingPrice")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.sellingPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Margin
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold ${
                        margin >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(margin)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Margin %
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold ${
                        margin >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {marginPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </section>

              {/* Stock */}
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
                <div className="mb-4 flex items-center gap-2">
                  <Box className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Stock
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("stock")}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stockNumber}{product.unitName ? " " + product.unitName : ""}
                    </p>
                    {isLowStock && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {t("lowStock")}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("reorderLevel")}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {reorderNumber}
                    </p>
                  </div>
                  <div className="col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Stock value
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stockValue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pl-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Stock level</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {Math.min(100, (stockNumber / Math.max(reorderNumber, 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (stockNumber / Math.max(reorderNumber, 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ---------- Summary sidebar ---------- */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Summary
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Selling price</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Cost price</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {formatCurrency(product.costPrice)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Margin</span>
                    <span
                      className={`font-semibold ${
                        margin >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(margin)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Current stock
                    </span>
                    <span className={`text-lg font-bold ${isLowStock ? "text-amber-600" : "text-emerald-600"}`}>
                      {stockNumber}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                {/* Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                        product.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.isActive
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Created</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                {/* Actions */}
                <div className="grid gap-2">
                  <Link
                    href={`/inventory/products/${id}/edit`}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99]"
                  >
                    <Edit className="h-4 w-4" />
                    Edit product
                  </Link>
                  <Link
                    href="/inventory/adjust"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800"
                  >
                    <Package className="h-4 w-4" />
                    Adjust stock
                  </Link>
                  <Link
                    href="/inventory/ledger"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800"
                  >
                    <Box className="h-4 w-4" />
                    Stock ledger
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}
