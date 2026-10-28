"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { Plus, User, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/lib/page-guard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function CustomersPage() {
  const t = useTranslations("sales");
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => apiFetch(`${API}/api/v1/sales/customers`, {
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
    }),
  });
  const customers = (data?.data ?? data ?? []) as Array<{ id: string; nameEn: string; nameBn?: string | null; phone?: string | null; email?: string | null; address?: string | null; isActive?: boolean }>;

  return (
    <PageGuard requiredPermission="sales.*" redirectTo="/dashboard">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("customers")}</h1>
          <Link href="/sales/customers/new" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && customers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <User className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No customers yet</p>
          </div>
        )}

        <Card className="border-border/50 shadow-sm">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.filter((c) => !search || c.nameEn?.toLowerCase().includes(search.toLowerCase())).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nameEn}</TableCell>
                    <TableCell>{c.phone ?? "—"}</TableCell>
                    <TableCell>{c.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.isActive !== false ? "default" : "secondary"}>
                        {c.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/sales/customers/${c.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <User className="h-4 w-4" />
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageGuard>
  );
}
