"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/lib/page-guard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

export default function UsersPage() {
  const t = useTranslations("nav");
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch(`${API}/api/v1/users`, { headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() } }),
  });
  const users = (data?.data ?? data ?? []) as Array<{ id: string; nameEn?: string; name?: string; email: string; role?: string; isActive?: boolean }>;

  return (
    <PageGuard requiredPermission="users.manage" redirectTo="/dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("users")}</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>All users in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 animate-pulse rounded bg-muted" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nameEn || user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role || "User"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/users/${user.id}/edit`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                          <User className="h-4 w-4" />
                          Edit
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageGuard>
  );
}
