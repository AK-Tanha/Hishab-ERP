"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function LedgerPage() {
  const t = useTranslations("accounting");
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const { data, isLoading } = useQuery({
    queryKey: ["ledger", accountId],
    queryFn: () => apiFetch(`${API}/api/v1/accounting/ledger/${accountId}`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const result = data?.data ?? data ?? { account: null, rows: [], closingBalance: 0 };
  const rows = (result.rows ?? []) as { date: string; entryNumber: string; description: string; debit: number; credit: number; balance: number }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{result.account?.nameEn ?? t("ledger")}</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">{t("date")}</th>
              <th className="px-3 py-2 text-left">{t("description")}</th>
              <th className="px-3 py-2 text-right">{t("debit")}</th>
              <th className="px-3 py-2 text-right">{t("credit")}</th>
              <th className="px-3 py-2 text-right">{t("balance")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 text-xs">{r.date}</td>
                <td className="px-3 py-2">{r.description}</td>
                <td className="px-3 py-2 text-right">{(r.debit / 100).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{(r.credit / 100).toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium">{(r.balance / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm font-medium">{t("balance")}: {(result.closingBalance / 100).toFixed(2)}</p>
    </div>
  );
}
