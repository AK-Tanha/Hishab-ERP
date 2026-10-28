"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  Plus,
  Package,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  DollarSign,
  Box,
  Warehouse,
  ArrowUpRight,
} from "lucide-react";
import type { Product } from "@/lib/inventory-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

/* ---------- component ---------- */

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "low" | "active">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      apiFetch(`${API}/api/v1/inventory/products`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
  });

  const products = React.useMemo(
    () => ((data?.data ?? data ?? []) as Product[]),
    [data]
  );

  /* derived stats */
  const stats = React.useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((s, p) => s + (p.costPrice || 0), 0);
    return { total, totalValue };
  }, [products]);

  /* filtered list */
  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.nameBn?.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [products, search]);

  const statCards = [
    {
      label: t("products"),
      value: stats.total,
      icon: Package,
      tint: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Stock Value",
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      tint: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: t("categories"),
      value: "—",
      icon: Box,
      tint: "from-violet-500/10 to-violet-500/5",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      label: t("warehouses"),
      value: "—",
      icon: Warehouse,
      tint: "from-amber-500/10 to-amber-500/5",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  const filterTabs = [
    { id: "all" as const, label: "All" },
    { id: "low" as const, label: "Low Stock" },
    { id: "active" as const, label: "Active" },
  ];

  return (
    <PageGuard requiredPermission="inventory.*" redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t("products")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage and track all your products in one place
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/inventory/products/new"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                {t("newProduct")}
              </Link>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ring-1 ring-slate-100`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- Toolbar ---------- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or SKU..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- List ---------- */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {search || filter !== "all" ? "No matching products" : "No products yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || filter !== "all"
                  ? "Try adjusting your search query or filter."
                  : t("createFirst")}
              </p>
              {!search && filter === "all" && (
                <Link
                  href="/inventory/products/new"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  {t("newProduct")}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/inventory/products/${p.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 sm:p-5 block"
                >
                  <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/60">
                        {p.sku?.charAt(0) || "P"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">
                            {p.nameEn}
                          </span>
                          {p.nameBn && (
                            <span className="text-xs text-slate-400 lang-bn">
                              {p.nameBn}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="truncate max-w-[160px]">
                            SKU: {p.sku}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(p.sellingPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/inventory/products/${p.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        aria-label="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/inventory/products/${p.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ---------- Footer count ---------- */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-slate-500">
              <span>
                Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-700">{products.length}</span> products
              </span>
              <span className="inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Updated just now
              </span>
            </div>
          )}
        </div>
      </div>
    </PageGuard>
  );
}
