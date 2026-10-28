"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const getLocale = () => {
    if (!pathname) return "en";
    if (pathname.startsWith("/bn")) return "bn";
    if (pathname.startsWith("/en")) return "en";
    return "en";
  };
  
  const currentLocale = getLocale();

  const switchLocale = (loc: "en" | "bn") => {
    if (!pathname) return;
    if (pathname.startsWith("/en/") || pathname.startsWith("/bn/")) {
      const newPath = pathname.replace(/^\/(en|bn)/, `/${loc}`);
      router.push(newPath);
    } else if (pathname === "/en" || pathname === "/bn") {
      router.push(`/${loc}`);
    } else {
      router.push(`/${loc}${pathname}`);
    }
    router.refresh();
  };

  return (
    <button
      onClick={() => switchLocale(currentLocale === "en" ? "bn" : "en")}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs uppercase">{currentLocale}</span>
    </button>
  );
}
