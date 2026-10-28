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

export default function InvoicesPage() {
  const t = useTranslations("sales");
  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiFetch(`${API}/api/v1/sales/invoices`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const invoices = (data?.data ?? data ?? []) as { id: string; invoiceNumber: string; customer?: { nameEn: string } | null; total: number; paidAmount: number; status: string; date: string }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("invoices")}</h1>
        <Link href="/sales/invoices/new" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          {t("newInvoice")}
        </Link>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      {!isLoading && invoices.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No invoices yet</p>
        </div>
      )}
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{inv.invoiceNumber}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-700" : inv.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                {inv.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {inv.customer?.nameEn ?? "Walk-in"} · {inv.date}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{t("total")}: {(inv.total / 100).toFixed(2)}</span>
              <span>{t("paid")}: {(inv.paidAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
