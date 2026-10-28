"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { Plus, Search, Package } from "lucide-react";
import type { Product } from "@/lib/inventory-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") || "";
}

function getTenant() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tenantId") || "";
}

async function fetchProducts() {
  const res = await apiFetch(`${API}/api/v1/inventory/products`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "X-Tenant-ID": getTenant(),
    },
  });
  return res.data ?? res;
}

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [search, setSearch] = React.useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", search],
    queryFn: fetchProducts,
  });

  const products = (data ?? []).filter((p: Product) =>
    search
      ? p.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.nameBn?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("products")}</h1>
        <div className="flex items-center gap-2">
          <Link href="/inventory/ledger" className="flex h-10 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted">
            {t("ledger")}
          </Link>
          <Link href="/inventory/adjust" className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium hover:opacity-90">
            {t("adjustStock")}
          </Link>
          <Link href="/inventory/products/new" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" />
            {t("newProduct")}
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Failed to load products</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-primary hover:underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">{t("noProducts")}</p>
          <p className="text-sm text-muted-foreground">{t("createFirst")}</p>
        </div>
      )}

      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
        {products.map((p: Product) => (
          <Link
            key={p.id}
            href={`/inventory/products/${p.id}`}
            className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.nameEn}</p>
                {p.nameBn && <p className="truncate text-xs text-muted-foreground lang-bn">{p.nameBn}</p>}
                <p className="mt-1 text-xs text-muted-foreground">SKU: {p.sku}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {p.sellingPrice / 100} ৳
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
