"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations("inventory");
  const router = useRouter();
  const { id } = params;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiFetch(`${API}/api/v1/inventory/products/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
    }),
  });

  const product = (data?.data ?? data ?? {}) as Product;

  const stockNumber = Number(product.currentStock ?? 0);
  const reorderNumber = Number(product.reorderLevel ?? 0);
  const isLowStock = stockNumber <= reorderNumber;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <div className="animate-pulse rounded-xl bg-muted h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.nameEn}</h1>
          {product.nameBn && <p className="text-muted-foreground lang-bn">{product.nameBn}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/inventory/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm(t("deleteConfirm") || "Delete this product?")) {
                fetch(`${API}/api/v1/inventory/products/${id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
                })              .then(() => router.push("/inventory"))
              .then(() => refetch());
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("sku")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="font-mono text-lg font-bold">{product.sku}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("category")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-sm">{product.categoryNameEn || "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("unit")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-sm">{product.unitName || "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("costPrice")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-lg font-bold">৳{(product.costPrice / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("sellingPrice")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-lg font-bold">৳{(product.sellingPrice / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className={cn("border-border/50 shadow-sm", isLowStock ? "border-amber-200/50 bg-amber-50/50" : "")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stock")}</CardTitle>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className={cn("text-2xl font-bold", isLowStock ? "text-amber-600" : "text-foreground")}>
              {stockNumber}{product.unitName ? " " + product.unitName : ""}
            </div>
            {isLowStock && (
              <p className="text-xs text-amber-600 mt-1">{t("lowStock")}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("reorderLevel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-lg font-bold">{reorderNumber}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {t("details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Cost Price</p>
                <p className="text-sm text-muted-foreground">৳{(product.costPrice / 100).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Selling Price</p>
                <p className="text-sm text-muted-foreground">৳{(product.sellingPrice / 100).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t("reorderLevel")}</p>
                <p className="text-sm text-muted-foreground">{reorderNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href={`/inventory/products/${id}/edit`}
              className="flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </Link>
            <Link
              href="/inventory/adjust"
              className="flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Adjust Stock
            </Link>
            <Link
              href="/inventory/ledger"
              className="flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Stock Ledger
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/inventory" className="flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
