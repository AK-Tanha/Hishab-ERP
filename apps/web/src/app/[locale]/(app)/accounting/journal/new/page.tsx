"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

interface Line { accountId: string; debit: number; credit: number; description: string; }

export default function NewJournalEntryPage() {
  const t = useTranslations("accounting");
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch(`${API}/api/v1/accounting/accounts`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const accounts = (data?.data ?? data ?? []) as { id: string; code: string; nameEn: string }[];
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiFetch(`${API}/api/v1/accounting/journal`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
      body: JSON.stringify(payload),
    }),
    onSuccess: () => router.push("/accounting"),
  });

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      date,
      description,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debit: Math.round(l.debit * 100),
        credit: Math.round(l.credit * 100),
        description: l.description || null,
      })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("newEntry")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("description")}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" required />
          </div>
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-4 rounded-lg border border-border bg-card p-3">
              <select value={line.accountId} onChange={(e) => { const n = [...lines]; n[idx].accountId = e.target.value; setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option value="">— account —</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} {a.nameEn}</option>)}
              </select>
              <input type="number" step="any" placeholder={t("debit")} value={line.debit} onChange={(e) => { const n = [...lines]; n[idx].debit = Number(e.target.value); setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
              <input type="number" step="any" placeholder={t("credit")} value={line.credit} onChange={(e) => { const n = [...lines]; n[idx].credit = Number(e.target.value); setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
              <div className="flex gap-2">
                <input placeholder={t("description")} value={line.description} onChange={(e) => { const n = [...lines]; n[idx].description = e.target.value; setLines(n); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" />
                <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setLines([...lines, { accountId: "", debit: 0, credit: 0, description: "" }])} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm hover:bg-muted">
            <Plus className="h-4 w-4" /> Add line
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
          <span>{t("totalDebit")}: {totalDebit.toFixed(2)}</span>
          <span>{t("totalCredit")}: {totalCredit.toFixed(2)}</span>
          <span className={totalDebit === totalCredit && totalDebit > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {totalDebit === totalCredit ? t("balanced") : t("unbalanced")}
          </span>
        </div>

        <button type="submit" disabled={mutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
        {mutation.isError && <p className="text-sm text-destructive">Failed to create entry</p>}
      </form>
    </div>
  );
}
