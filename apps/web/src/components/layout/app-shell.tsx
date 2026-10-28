"use client";

import * as React from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Home, ShoppingBag, Package, BarChart3, MoreHorizontal, Plus } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const navItems = [
  { href: "/dashboard", labelKey: "nav.home", icon: Home },
  { href: "/sales", labelKey: "nav.sales", icon: ShoppingBag },
  { href: "/inventory", labelKey: "nav.inventory", icon: Package },
  { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  { href: "/more", labelKey: "nav.more", icon: MoreHorizontal },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const tenant = typeof window !== "undefined" ? localStorage.getItem("tenantId") : null;
    if (!token || !tenant) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <span className="font-bold text-lg">Hishab</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </aside>

      <main className="md:pl-64 pb-20 md:pb-6 min-h-dvh">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
          <span className="font-semibold md:hidden">Hishab</span>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </header>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] rounded-lg transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <button
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label={t("nav.newInvoice")}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
