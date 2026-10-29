"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { PageGuard } from "@/lib/page-guard";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  Wallet,
  Calendar,
  User,
  Warehouse,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  ShoppingCart,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer?: { id: string; nameEn: string } | null;
  warehouse?: { id: string; nameEn: string } | null;
  total: number;
  paidAmount: number;
  status: string;
  date: string;
  items?: {
    id: string;
    product?: { nameEn: string };
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
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
        dot: "bg-emerald-500",
      };
    case "partial":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
        dot: "bg-amber-500",
      };
    case "overdue":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: AlertCircle,
        dot: "bg-rose-500",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-800",
        icon: FileText,
        dot: "bg-slate-400",
      };
  }
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const t = useTranslations("sales");

  const { data, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () =>
      apiFetch(`${API}/api/v1/sales/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
    enabled: !!id,
  });

  const inv = (data?.data ?? data ?? null) as Invoice | null;

  if (isLoading || !inv) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/sales/invoices"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t("invoice")}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Invoice details and payment summary
              </p>
            </div>
          </div>
          <div className="space-y-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </section>
            <section className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusStyle(inv.status);
  const StatusIcon = status.icon;
  const balance = inv.total - inv.paidAmount;
  const paymentProgress =
    inv.total > 0 ? Math.min(100, (inv.paidAmount / inv.total) * 100) : 0;
  const isPartial = inv.status === "partial";
  const isFullyPaid = inv.status === "paid";

  return (
    <PageGuard requiredPermission="sales.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/sales/invoices"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to invoices"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {t("invoice")}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Invoice #{inv.invoiceNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/sales/invoices/${inv.id}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              >
                <Save className="h-4 w-4" />
                Edit
              </Link>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${status.bg} ${status.text} ${status.border}`}
              >
                <StatusIcon className="h-3 w-3" />
                <span className="capitalize">{inv.status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: t("total"),
                value: formatCurrency(inv.total),
                icon: ShoppingCart,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("paid"),
                value: formatCurrency(inv.paidAmount),
                icon: Wallet,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Balance due",
                value: formatCurrency(Math.max(0, balance)),
                icon: AlertCircle,
                tint: isFullyPaid
                  ? "from-emerald-500/10 to-emerald-500/5"
                  : "from-amber-500/10 to-amber-500/5",
                iconColor: isFullyPaid ? "text-emerald-600" : "text-amber-600",
                iconBg: isFullyPaid ? "bg-emerald-50" : "bg-amber-50",
              },
              {
                label: t("date"),
                value: formatDate(inv.date),
                icon: Calendar,
                tint: "from-slate-500/10 dark:from-white/10 to-slate-500/5 dark:to-white/5",
                iconColor: "text-slate-600 dark:text-slate-400",
                iconBg: "bg-slate-50 dark:bg-slate-800",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5 transition-all hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.tint} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ring-1 ring-slate-100 dark:ring-slate-700`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("customer")}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                      {inv.customer?.nameEn
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "W"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {inv.customer?.nameEn ?? "Walk-in customer"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {inv.warehouse?.nameEn ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Warehouse</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Line Items
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {(inv.items?.length ?? 0)} item{
                    (inv.items?.length ?? 0) !== 1 ? "s" : ""
                  }
                  </span>
                </div>

                <div className="hidden grid-cols-[1.6rem_1.6fr_0.7fr_0.9fr_1.2fr_0.9fr_2.5rem] gap-2 px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:grid">
                  <div>#</div>
                  <div>Product</div>
                  <div>Qty</div>
                  <div>Price</div>
                  <div>Description</div>
                  <div className="text-right">Subtotal</div>
                  <div />
                </div>

                <div className="space-y-2">
                  {(inv.items ?? []).map((item, idx) => {
                    const subtotal =
                      (item.quantity || 0) * (item.unitPrice || 0);
                    return (
                      <div
                        key={item.id ?? idx}
                        className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3 transition-colors hover:border-slate-300 hover:dark:border-slate-700 sm:grid-cols-[1.6rem_1.6fr_0.7fr_0.9fr_1.2fr_0.9fr_2.5rem] sm:items-center sm:bg-transparent sm:p-2 sm:hover:bg-slate-50/60 sm:hover:dark:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between sm:block">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:hidden">
                            Item {idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {item.product?.nameEn ?? "Product"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {item.quantity || 0}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.unitPrice || 0)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {item.description ?? "—"}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:hidden">
                            Subtotal
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-right">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-paid to-due" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Summary
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(inv.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Paid</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(inv.paidAmount)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Balance due
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        isFullyPaid
                          ? "text-emerald-600"
                          : isPartial
                            ? "text-amber-600"
                            : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {formatCurrency(Math.max(0, balance))}
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                        isFullyPaid
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isPartial
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isFullyPaid
                            ? "bg-emerald-500"
                            : isPartial
                              ? "bg-amber-500"
                              : "bg-slate-400"
                        }`}
                      />
                      {isFullyPaid
                        ? "Fully paid"
                        : isPartial
                          ? "Partial payment"
                          : "Unpaid"}
                    </span>
                  </div>

                  {isPartial && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Payment progress</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {paymentProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                          style={{ width: `${paymentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                <div className="grid gap-2">
                  <button
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800"
                    aria-label="Download invoice"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <Link
                    href={`/sales/invoices/${inv.id}`}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800"
                    aria-label="View invoice"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/sales/invoices/${inv.id}/edit`}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99]"
                  >
                    <Save className="h-4 w-4" />
                    Edit invoice
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}
