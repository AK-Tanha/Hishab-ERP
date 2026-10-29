"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  Receipt,
  Percent,
  ShoppingCart,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type BillItem = {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  product?: { nameEn: string } | null;
};

type Bill = {
  id: string;
  billNumber: string;
  supplier?: { id: string; nameEn: string; nameBn: string | null; phone: string | null; email: string | null; address: string | null } | null;
  date: string;
  dueDate: string | null;
  status: string;
  subtotal: number;
  vat: number;
  total: number;
  paidAmount: number;
  notes: string | null;
  items?: BillItem[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((cents || 0) / 100);
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

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle2,
      };
    case "partial":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-800",
        icon: FileText,
      };
  }
}

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const t = useTranslations("purchases");

  const { data, isLoading } = useQuery({
    queryKey: ["bill", id],
    queryFn: () =>
      apiFetch(`${API}/api/v1/purchases/bills/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
    enabled: !!id,
  });

  const bill = (data?.data ?? data ?? null) as Bill | null;

  if (isLoading || !bill) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-12 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
            ))}
          </div>
          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse lg:col-span-2" />
            <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusStyle(bill.status);
  const StatusIcon = status.icon;
  const balance = Math.max(0, bill.total - bill.paidAmount);
  const isPaid = bill.status === "paid";
  const paymentProgress = bill.total > 0 ? Math.min(100, (bill.paidAmount / bill.total) * 100) : 0;
  const items = bill.items ?? [];

  return (
    <PageGuard requiredPermission="purchases.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/purchases/bills"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to bills"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {bill.billNumber}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {[bill.supplier?.nameEn, formatDate(bill.date)].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto ${status.bg} ${status.text} ${status.border}`}
            >
              <StatusIcon className="h-3 w-3" />
              <span className="capitalize">{bill.status}</span>
            </span>
          </div>

          {/* ---------- KPIs ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: t("subtotal"),
                value: formatCurrency(bill.subtotal),
                icon: Receipt,
                tint: "from-slate-500/10 dark:from-white/10 to-slate-500/5 dark:to-white/5",
                iconColor: "text-slate-600 dark:text-slate-400",
                iconBg: "bg-slate-50 dark:bg-slate-800",
              },
              {
                label: t("vat"),
                value: formatCurrency(bill.vat),
                icon: Percent,
                tint: "from-violet-500/10 to-violet-500/5",
                iconColor: "text-violet-600",
                iconBg: "bg-violet-50",
              },
              {
                label: t("total"),
                value: formatCurrency(bill.total),
                icon: ShoppingCart,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("due"),
                value: formatCurrency(balance),
                icon: AlertCircle,
                tint: isPaid ? "from-emerald-500/10 to-emerald-500/5" : "from-amber-500/10 to-amber-500/5",
                iconColor: isPaid ? "text-emerald-600" : "text-amber-600",
                iconBg: isPaid ? "bg-emerald-50" : "bg-amber-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5"
                >
                  <div className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl ${stat.tint}`} />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                    </div>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
            {/* ---------- Items ---------- */}
            <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("items")}
                </h2>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <Receipt className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No items on this bill</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3 font-medium">#</th>
                        <th className="px-5 py-3 font-medium">Description</th>
                        <th className="px-5 py-3 text-right font-medium">Qty</th>
                        <th className="px-5 py-3 text-right font-medium">Unit cost</th>
                        <th className="px-5 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {items.map((it, idx) => (
                        <tr key={it.id} className="transition-colors hover:bg-slate-50 hover:dark:bg-slate-800/40">
                          <td className="px-5 py-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {it.product?.nameEn || it.description || "—"}
                            </p>
                            {it.product?.nameEn && it.description && it.description !== it.product.nameEn ? (
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{it.description}</p>
                            ) : null}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{it.quantity}</td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">
                            {formatCurrency(it.unitCost)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(Math.round((it.quantity || 0) * (it.unitCost || 0)))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ---------- Summary + supplier ---------- */}
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Summary
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">{t("subtotal")}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(bill.subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">{t("vat")}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(bill.vat)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    <dt className="font-semibold text-slate-900 dark:text-slate-100">{t("total")}</dt>
                    <dd className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(bill.total)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">{t("paid")}</dt>
                    <dd className="font-medium text-emerald-600">{formatCurrency(bill.paidAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-medium text-slate-900 dark:text-slate-100">{t("due")}</dt>
                    <dd className={`font-bold ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {formatCurrency(balance)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-xs font-medium text-slate-400 dark:text-slate-500">
                    {Math.round(paymentProgress)}%
                  </p>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </span>
                    <span className="font-medium">{formatDate(bill.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Due date
                    </span>
                    <span className="font-medium">{bill.dueDate ? formatDate(bill.dueDate) : "—"}</span>
                  </div>
                </div>
              </section>

              {bill.supplier ? (
                <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("supplier")}
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {bill.supplier.nameEn}
                      </p>
                      {bill.supplier.nameBn ? (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{bill.supplier.nameBn}</p>
                      ) : null}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm">
                    {[
                      { icon: Phone, value: bill.supplier.phone },
                      { icon: Mail, value: bill.supplier.email },
                      { icon: MapPin, value: bill.supplier.address },
                    ].map((row, i) => {
                      const Icon = row.icon;
                      return (
                        <li key={i} className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                          <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">{row.value || "—"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {bill.notes ? (
                <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notes
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{bill.notes}</p>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}
