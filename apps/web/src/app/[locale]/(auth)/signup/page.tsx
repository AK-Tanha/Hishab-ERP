"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("tenants");
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{tn("register")}</h1>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{tn("businessName")} (English)</label>
            <input className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{tn("businessName")} (বাংলা)</label>
            <input className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("subdomain")}</label>
            <input className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("email")}</label>
            <input type="email" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("password")}</label>
            <input type="password" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            {t("createAccount")}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
