"use client";

import * as React from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = (pathname.split("/")[1] as "en" | "bn") || "en";

  const switchLocale = (loc: "en" | "bn") => {
    router.replace(pathname, { locale: loc });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => switchLocale("en")}
        className={cn("px-2 py-1.5 text-xs font-medium rounded transition-colors", currentLocale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
      >
        En
      </button>
      <button
        onClick={() => switchLocale("bn")}
        className={cn("px-2 py-1.5 text-xs font-medium rounded transition-colors", currentLocale === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
      >
        বাংলা
      </button>
    </div>
  );
}
