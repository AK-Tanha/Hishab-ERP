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
  ShoppingCart,
  Wallet,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

type Customer = {
  id: string;
  nameEn: string;
  nameBn: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  total: number;
  paidAmount: number;
  status: string;
  date: string;
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

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const t = useTranslations("sales");

  const { data: customerData, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () =>
      apiFetch(`${API}/api/v1/sales/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
    enabled: !!id,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["customer-invoices", id],
    queryFn: () =>
      apiFetch(`${API}/api/v1/sales/invoices?customerId=${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
      }),
    enabled: !!id,
  });

  const c = (customerData?.data ?? customerData ?? null) as Customer | null;
  const invoices = ((invoicesData?.data ?? invoicesData ?? []) as InvoiceRow[]) || [];

  if (isLoading || !c) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-12 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
            ))}
          </div>
          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="h-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse lg:col-span-2" />
            <div className="h-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const totalSales = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const outstanding = Math.max(0, totalSales - totalPaid);

  return (
    <PageGuard requiredPermission="sales.*" redirectTo="/dashboard">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/sales/customers"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
                aria-label="Back to customers"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {c.nameEn}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {[c.nameBn, c.phone].filter(Boolean).join(" • ") || t("customer")}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto ${
                c.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
              {c.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* ---------- KPIs ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: t("invoices"),
                value: String(invoices.length),
                icon: FileText,
                tint: "from-slate-500/10 dark:from-white/10 to-slate-500/5 dark:to-white/5",
                iconColor: "text-slate-600 dark:text-slate-400",
                iconBg: "bg-slate-50 dark:bg-slate-800",
              },
              {
                label: t("total"),
                value: formatCurrency(totalSales),
                icon: ShoppingCart,
                tint: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
              },
              {
                label: t("paid"),
                value: formatCurrency(totalPaid),
                icon: Wallet,
                tint: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-50",
              },
              {
                label: t("due"),
                value: formatCurrency(outstanding),
                icon: AlertCircle,
                tint: outstanding > 0 ? "from-amber-500/10 to-amber-500/5" : "from-emerald-500/10 to-emerald-500/5",
                iconColor: outstanding > 0 ? "text-amber-600" : "text-emerald-600",
                iconBg: outstanding > 0 ? "bg-amber-50" : "bg-emerald-50",
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
            {/* ---------- Invoices ---------- */}
            <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("invoices")}
                </h2>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{invoices.length}</span>
              </div>
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No invoices yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {invoices.map((inv) => {
                    const st = getStatusStyle(inv.status);
                    const StatusIcon = st.icon;
                    const due = Math.max(0, inv.total - inv.paidAmount);
                    return (
                      <li key={inv.id}>
                        <Link
                          href={`/sales/invoices/${inv.id}`}
                          className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800/60"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                            <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {inv.invoiceNumber}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Calendar className="h-3 w-3" />
                              {formatDate(inv.date)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${st.bg} ${st.text} ${st.border}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{inv.status}</span>
                          </span>
                          <div className="ml-auto text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(inv.total)}
                            </p>
                            <p
                              className={`mt-0.5 text-xs font-medium ${
                                due > 0 ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {due > 0 ? `${t("due")} ${formatCurrency(due)}` : t("paid")}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ---------- Contact ---------- */}
            <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Contact
              </h2>
              <ul className="mt-4 space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: c.phone },
                  { icon: Mail, label: "Email", value: c.email },
                  { icon: MapPin, label: "Address", value: c.address },
                  { icon: Users, label: "Bangla name", value: c.nameBn },
                  { icon: Calendar, label: "Member since", value: formatDate(c.createdAt) },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <li key={row.label} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{row.label}</p>
                        <p className="mt-0.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
                          {row.value || "—"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}
