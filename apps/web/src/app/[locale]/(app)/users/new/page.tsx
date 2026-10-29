"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  FileText,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { apiUrl } from "@/lib/config";

const API = apiUrl;
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
}
function getTenant() {
  return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : "";
}

interface UserForm {
  nameEn: string;
  nameBn: string;
  email: string;
  phone: string;
  isActive: boolean;
}

/* ---------- reusable bits ---------- */

function Field({
  label,
  htmlFor,
  children,
  hint,
  required,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

/* ---------- main component ---------- */

export default function NewUserPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<UserForm>({
    nameEn: "",
    nameBn: "",
    email: "",
    phone: "",
    isActive: true,
  });
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`${API}/api/v1/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => router.push("/users"),
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create user";
      setSubmitError(msg);
    },
  });

  /* derived */
  const canSubmit =
    !!form.nameEn && !!form.email && !!form.phone && !mutation.isPending;

  const updateField = (key: keyof UserForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    mutation.mutate({
      nameEn: form.nameEn,
      nameBn: form.nameBn || null,
      email: form.email,
      phone: form.phone || null,
      isActive: form.isActive,
    });
  };

  /* loading state */

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Add User
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Create a new user account for your organization
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Draft
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* ---------- Main column ---------- */}
          <div className="space-y-6 lg:col-span-2">
            {/* User details */}
            <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  User Details
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name (English)" required>
                  <input
                    id="nameEn"
                    value={form.nameEn}
                    onChange={(e) => updateField("nameEn", e.target.value)}
                    placeholder="Full name"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-3 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Name (Bengali)">
                  <input
                    id="nameBn"
                    value={form.nameBn}
                    onChange={(e) => updateField("nameBn", e.target.value)}
                    placeholder="পূর্ণ নাম"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-3 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Email" required>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="name@company.com"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
                <Field label="Phone">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </Field>
                <Field label="Active">
                  <div className="flex items-center gap-3">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => updateField("isActive", e.target.checked)}
                      className="h-4 w-4 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                      Mark user as active
                    </label>
                  </div>
                </Field>
              </div>
            </section>
          </div>

          {/* ---------- Summary sidebar ---------- */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Summary
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {form.nameEn || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {form.email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {form.phone || "—"}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                      form.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        form.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700" />

              {/* Validation hint */}
              {(form.nameEn === "" || form.email === "") && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Name and email are required.</span>
                </div>
              )}

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save user
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 hover:dark:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
