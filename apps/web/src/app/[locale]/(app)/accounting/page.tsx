"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function ChartOfAccountsPage() {
  const t = useTranslations("accounting");
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch(`${API}/api/v1/accounting/accounts`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const accounts = (data?.data ?? data ?? []) as { id: string; code: string; nameEn: string; nameBn?: string | null; type: string }[];

  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    (acc[a.type] = acc[a.type] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("chartOfAccounts")}</h1>
      </div>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      {Object.entries(grouped).map(([type, accs]) => (
        <div key={type} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">{t(type as "asset" | "liability" | "equity" | "income" | "expense")}</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {accs.map((a) => (
              <Link
                key={a.id}
                href={`/accounting/ledger/${a.id}`}
                className="flex items-center justify-between p-3 hover:bg-muted/50"
              >
                <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                <span className="flex-1 px-3 text-sm">{a.nameEn}</span>
                {a.nameBn && <span className="text-xs text-muted-foreground lang-bn">{a.nameBn}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Link href="/accounting/journal/new" className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          {t("newEntry")}
        </Link>
        <Link href="/accounting/trial-balance" className="flex h-10 flex-1 items-center justify-center rounded-lg border border-input text-sm font-medium hover:bg-muted">
          {t("trialBalance")}
        </Link>
      </div>
    </div>
  );
}
