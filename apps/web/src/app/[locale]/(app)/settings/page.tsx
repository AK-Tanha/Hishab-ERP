"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">{t("theme")}</p>
        <div className="mt-2 flex gap-2">
          {["light", "dark", "system"].map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              className={`flex h-9 items-center rounded-lg border px-3 text-sm ${theme === th ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
            >
              {t(th as "light" | "dark" | "system")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
