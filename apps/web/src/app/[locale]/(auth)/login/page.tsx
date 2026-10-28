"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { Link } from "@/i18n/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [subdomain, setSubdomain] = React.useState("demo");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantSubdomain: subdomain }),
      });
      const resData = res as { data?: { tokens?: { accessToken?: string; refreshToken?: string }; user?: { tenantId?: string } } };
      const tokens = resData.data?.tokens;
      const user = resData.data?.user;
      if (tokens?.accessToken) {
        localStorage.setItem("accessToken", tokens.accessToken);
        if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      if (user?.tenantId) localStorage.setItem("tenantId", user.tenantId);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("invalidCredentials");
      setError(msg || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t("login")}</h1>
          <p className="text-sm text-muted-foreground">{t("welcomeBack")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tenant subdomain</label>
            <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="demo" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Signing in..." : t("signIn")}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {t("createAccount")}{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            {t("signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
