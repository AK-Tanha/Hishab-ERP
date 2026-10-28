"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer";
import { navGroups, quickActions, isActive } from "./nav-config";
import { canAccessNavItem, getUserName, getCurrentUser } from "@/lib/role-access";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Permission needed for each quick action (the action's link decides, not the page)
const QUICK_ACTION_PERMISSION: Record<string, string> = {
  "/dashboard": "sales.*", // dashboard action is "New invoice"
  "/sales": "sales.*",
  "/purchases": "purchases.*",
  "/inventory": "inventory.*",
};

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
  const [userName, setUserName] = React.useState(getUserName() || "User");

  // Fetch full user profile from /auth/me so nameEn works even with old JWTs
  React.useEffect(() => {
    if (!ready) return;
    getCurrentUser().then((u) => {
      if (u?.nameEn) setUserName(u.nameEn);
    });
  }, [ready]);

  // Filter nav groups based on user permissions
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(item)),
    }))
    .filter((group) => group.items.length > 0);

  const allItems = visibleGroups.flatMap((g) => g.items);
  const tabItems = allItems.filter((i) => i.tab);
  const moreItems = allItems.filter((i) => !i.tab);

  const current = allItems.find((i) => isActive(pathname, i.href));
  const title = current ? t(current.labelKey) : "Hishab";
  const moreActive = moreItems.some((i) => isActive(pathname, i.href));

  // Send the user home if the page isn't in their allowed nav
  React.useEffect(() => {
    if (ready && !current && pathname !== "/dashboard" && pathname !== "/login") {
      router.replace("/dashboard");
    }
  }, [ready, pathname, current, router]);

  // Quick action: matches the current section, hidden on "new" forms,
  // and only shown if the user may use it
  const quickAction = pathname.endsWith("/new")
    ? undefined
    : quickActions.find((q) => {
        if (!isActive(pathname, q.match)) return false;
        const perm = QUICK_ACTION_PERMISSION[q.match];
        return !perm || canAccessNavItem({ requiredPermission: perm });
      });

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tenantId");
    router.replace("/login");
  };

  if (!ready) return <div className="min-h-dvh bg-background" aria-busy="true" />;

  return (
    <div
      className="min-h-dvh bg-background text-foreground"
      style={
        { "--header-h": "calc(4rem + env(safe-area-inset-top))" } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("nav.skipToContent")}
      </a>

      {/* ───────── Header: full width, fixed to the top ───────── */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--header-h)] items-stretch border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Brand cell: same width as the sidebar so the two line up */}
        <div className="flex items-center gap-3 pl-4 md:w-[72px] md:justify-center md:border-r md:border-border md:pl-0 lg:w-72 lg:justify-start lg:pl-6">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/80 font-bold text-primary-foreground shadow-sm">
            H
          </div>
          <span className="hidden text-lg font-semibold tracking-tight lg:inline">
            Hishab ERP
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 md:px-6">
          <p className="truncate text-lg font-semibold tracking-tight">{title}</p>
          <div className="flex items-center gap-6">
            <p className="text-sm">Hello, {userName}</p>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* ───────── Tablet rail + desktop sidebar: starts below the header ───────── */}
      <aside className="fixed bottom-0 left-0 top-[var(--header-h)] z-40 hidden w-[72px] flex-col border-r border-border bg-card md:flex lg:w-72">
        <nav aria-label={t("nav.main")} className="flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group, gi) => (
            <div key={group.id} className={cn(gi > 0 && "mt-6")}>
              {gi > 0 && (
                <>
                  {/* Divider on the narrow rail */}
                  <div className="mx-auto mb-2 h-px w-8 bg-border lg:hidden" />
                  {/* Group heading on the wide sidebar */}
                  <p className="mb-2 hidden px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:block">
                    {t(`nav.${group.id}`)}
                  </p>
                </>
              )}
              <ul className="space-y-1">
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
                          "flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors lg:justify-start lg:px-3",
                          FOCUS,
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="sr-only truncate font-medium lg:not-sr-only">
                          {label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-center border-t border-border p-2 lg:justify-start lg:px-3">
          <button
            onClick={logout}
            title={t("nav.logout")}
            aria-label={t("nav.logout")}
            className={cn(
              "flex h-9 items-center justify-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:w-full lg:justify-start lg:gap-2 lg:px-3",
              FOCUS,
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only text-sm font-medium lg:not-sr-only">
              {t("nav.logout")}
            </span>
          </button>
        </div>
      </aside>

      {/* ───────── Main: pushed below the header and beside the sidebar ───────── */}
      <main
        id="main-content"
        className={cn(
          "pt-[var(--header-h)] md:pl-[72px] lg:pl-72",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8",
            quickAction
              ? "pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-6 lg:pb-8"
              : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 lg:pb-8",
          )}
        >
          {children}
        </div>
      </main>
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






 