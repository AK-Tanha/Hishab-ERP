"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { Plus, FileText } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function BillsPage() {
  const t = useTranslations("purchases");
  const { data, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => apiFetch(`${API}/api/v1/purchases/bills`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const bills = (data?.data ?? data ?? []) as { id: string; billNumber: string; supplier?: { nameEn: string } | null; total: number; paidAmount: number; status: string; date: string }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("bills")}</h1>
        <Link href="/purchases/bills/new" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          {t("newBill")}
        </Link>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      {!isLoading && bills.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No bills yet</p>
        </div>
      )}
      <div className="space-y-3">
        {bills.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{b.billNumber}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.status === "paid" ? "bg-green-100 text-green-700" : b.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                {b.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {b.supplier?.nameEn ?? "—"} · {b.date}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Total: {(b.total / 100).toFixed(2)}</span>
              <span>Paid: {(b.paidAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
