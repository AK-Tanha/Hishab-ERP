"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { apiUrl } from "@/lib/config";
import Image from "next/image";

const API = apiUrl;

export default function SignupPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("tenants");
  const locale = useLocale();
  const logoSrc = locale === "bn" ? "/herpLogoBN.png" : "/herpLogo.png";
  const router = useRouter();
  const [businessEn, setBusinessEn] = React.useState("");
  const [businessBn, setBusinessBn] = React.useState("");
  const [subdomain, setSubdomain] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessNameEn: businessEn,
          businessNameBn: businessBn || null,
          subdomain,
          email,
          password,
        }),
      });
      const resData = res as { data?: { tenant?: { id: string }; user?: { tenantId?: string } } };
      const user = resData.data?.user;
      if (user?.tenantId) {
        localStorage.setItem("tenantId", user.tenantId);
      }
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("somethingWentWrong");
      setError(msg || t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/40 dark:bg-none p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <Image
              src={logoSrc}
              alt="Hishab ERP"
              width={75}
              height={44}
              className="h-11 w-[75px] shrink-0 rounded-xl object-cover shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Hishab ERP
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {tn("register")}
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ring-1 ring-inset ring-slate-100/60 dark:ring-slate-700/60">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("createAccount")}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Create your business account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={tn("businessName") + " (English)"}>
              <InputGroup icon={Building2}>
                <input
                  id="businessEn"
                  value={businessEn}
                  onChange={(e) => setBusinessEn(e.target.value)}
                  placeholder="Hishab Ltd."
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </InputGroup>
            </Field>

            <Field label={tn("businessName") + " (বাংলা)"}>
              <InputGroup icon={Building2}>
                <input
                  id="businessBn"
                  value={businessBn}
                  onChange={(e) => setBusinessBn(e.target.value)}
                  placeholder="হিসাব লিমিটেড"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </InputGroup>
            </Field>

            <Field label={t("subdomain")} hint="Your business subdomain">
              <InputGroup icon={Building2}>
                <input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="demo"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </InputGroup>
            </Field>

            <Field label={t("email")} hint="Your registered email address">
              <InputGroup icon={Mail}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </InputGroup>
            </Field>

            <Field label={t("password")} hint="Create a strong password">
              <div className="relative">
                <InputGroup icon={Lock}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-11 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </InputGroup>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:dark:text-slate-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <AlertCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  {t("createAccount")}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
            </span>
            <Link href="/login" className="text-primary font-medium hover:underline transition-colors">
              {t("login")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function InputGroup({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      {children}
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin -ml-1 mr-2 h-4 w-4 text-current ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
