"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer";
import { navGroups, quickActions, isActive } from "./nav-config";

const allItems = navGroups.flatMap((g) => g.items);
const tabItems = allItems.filter((i) => i.tab);
const moreItems = allItems.filter((i) => !i.tab);

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function useAuthGuard() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const ok =
      !!localStorage.getItem("accessToken") && !!localStorage.getItem("tenantId");
    if (ok) setReady(true);
    else router.replace("/login");
  }, [router]);
  return ready;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const ready = useAuthGuard();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const current = allItems.find((i) => isActive(pathname, i.href));
  const title = current ? t(current.labelKey) : "Hishab";
  const moreActive = moreItems.some((i) => isActive(pathname, i.href));

  // No quick action on "new" forms themselves
  const quickAction = pathname.endsWith("/new")
    ? undefined
    : quickActions.find((q) => isActive(pathname, q.match));

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tenantId");
    router.replace("/login");
  };

  if (!ready) return <div className="min-h-dvh bg-background" aria-busy="true" />;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("nav.skipToContent")}
      </a>

      {/* ───────── Tablet rail + desktop sidebar ───────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col border-r border-border bg-card md:flex lg:w-64">
        <div className="flex h-16 items-center justify-center gap-2 border-b border-border lg:justify-start lg:px-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
            H
          </span>
          <span className="hidden text-lg font-bold lg:inline">Hishab</span>
        </div>

        <nav aria-label={t("nav.main")} className="flex-1 overflow-y-auto p-3">
          {navGroups.map((group, gi) => (
            <ul
              key={group.id}
              className={cn("space-y-1", gi > 0 && "mt-3 border-t border-border pt-3")}
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                const label = t(item.labelKey);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:justify-start",
                        FOCUS,
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="sr-only truncate lg:not-sr-only">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-border p-3 lg:flex-row lg:justify-between">
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <button
            onClick={logout}
            title={t("nav.logout")}
            aria-label={t("nav.logout")}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              FOCUS,
            )}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* ───────── Main column ───────── */}
      <div className="md:pl-[72px] lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
            <p className="truncate text-base font-semibold md:text-lg">{title}</p>
            <div className="flex items-center gap-2">
              {quickAction && (
                <Link
                  href={quickAction.href}
                  className={cn(
                    "hidden items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex",
                    FOCUS,
                  )}
                >
                  <Plus className="h-4 w-4" />
                  {t(quickAction.labelKey)}
                </Link>
              )}
              <div className="flex items-center gap-1 md:hidden">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className={cn(
            "mx-auto w-full max-w-7xl p-4 md:p-6 md:pb-6",
            quickAction
              ? "pb-[calc(9rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(5rem+env(safe-area-inset-bottom))]",
          )}
        >
          {children}
        </main>
      </div>

      {/* ───────── Mobile: floating action button ───────── */}
      {quickAction && (
        <Link
          href={quickAction.href}
          aria-label={t(quickAction.labelKey)}
          className={cn(
            "fixed right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90 md:hidden",
            "bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)]",
            FOCUS,
          )}
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}

      {/* ───────── Mobile: bottom tab bar ───────── */}
      <nav
        aria-label={t("nav.main")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid h-16 grid-cols-5 px-1">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
                    FOCUS,
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      active && "bg-primary/10",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate px-0.5 text-[11px] font-medium leading-snug">
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}

          <li>
            <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
              <DrawerTrigger asChild>
                <button
                  className={cn(
                    "flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
                    FOCUS,
                    moreActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      moreActive && "bg-primary/10",
                    )}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate px-0.5 text-[11px] font-medium leading-snug">
                    {t("nav.more")}
                  </span>
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{t("nav.more")}</DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-3 gap-3 px-4 pb-2">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-border p-3 text-center text-sm font-medium transition-colors",
                          FOCUS,
                          active ? "bg-primary/10 text-primary" : "bg-card",
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="leading-snug">{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <button
                    onClick={logout}
                    className={cn(
                      "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground",
                      FOCUS,
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </button>
                </div>
              </DrawerContent>
            </Drawer>
          </li>
        </ul>
      </nav>
    </div>
  );
}