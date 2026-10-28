"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { BarChart3, TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { PageGuard } from "@/lib/page-guard";

const items = [
  { href: "/reports/sales", label: "Sales report", icon: TrendingUp },
  { href: "/reports/stock", label: "Stock report", icon: Package },
  { href: "/reports/receivables", label: "Receivables", icon: Users },
  { href: "/reports/payables", label: "Payables", icon: DollarSign },
  { href: "/reports/profit-loss", label: "Profit & Loss", icon: BarChart3 },
];

export default function ReportsPage() {
  return (
    <PageGuard requiredPermission="reports.*" redirectTo="/dashboard">
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
    </PageGuard>
  );
}
