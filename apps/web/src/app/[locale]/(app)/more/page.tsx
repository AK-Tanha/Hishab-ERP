"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { BookOpen, Package, BarChart3, Settings } from "lucide-react";

export default function MorePage() {
  const items = [
    { href: "/accounting", label: "Accounting", icon: BookOpen },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link key={it.href} href={it.href} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{it.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
