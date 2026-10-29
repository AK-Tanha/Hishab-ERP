"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function TrialBalancePage() {
  const t = useTranslations("accounting");
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["trial-balance"],
    queryFn: () => apiFetch(`${API}/api/v1/accounting/trial-balance`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const result = data?.data ?? data ?? { rows: [], totalDebit: 0, totalCredit: 0, balanced: true };
  const rows = (result.rows ?? []) as { account: { code: string; nameEn: string }; debit: number; credit: number }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("trialBalance")}</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">{t("code")}</th>
              <th className="px-3 py-2 text-left">{t("name")}</th>
              <th className="px-3 py-2 text-right">{t("debit")}</th>
              <th className="px-3 py-2 text-right">{t("credit")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{r.account.code}</td>
                <td className="px-3 py-2">{r.account.nameEn}</td>
                <td className="px-3 py-2 text-right">{(r.debit / 100).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{(r.credit / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted font-semibold">
            <tr>
              <td colSpan={2} className="px-3 py-2">{t("totalDebit")} / {t("totalCredit")}</td>
              <td className="px-3 py-2 text-right">{(result.totalDebit / 100).toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{(result.totalCredit / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className={`text-sm font-medium ${result.balanced ? "text-green-600" : "text-red-600"}`}>
        {result.balanced ? t("balanced") : t("unbalanced")}
      </p>
    </div>
  );
}
