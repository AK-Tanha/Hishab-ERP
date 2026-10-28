"use client";

import * as React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""; }
function getTenant() { return typeof window !== "undefined" ? localStorage.getItem("tenantId") || "" : ""; }

type User = {
  id: string;
  tenantId: string;
  email: string;
  phone: string | null;
  nameEn: string;
  nameBn: string | null;
  isActive: boolean;
  role: string | null;
  roleId: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { id } = React.use(params);

  React.useEffect(() => {
    apiFetch(`${API}/api/v1/users/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "X-Tenant-ID": getTenant() },
    }).then((res) => {
      const u = (res?.data ?? res) as User;
      setUser(u);
      setIsLoading(false);
    }).catch(() => {
      setError("Failed to load user");
      setIsLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      const form = new FormData(e.currentTarget as HTMLFormElement);
      const body = {
        nameEn: form.get("nameEn"),
        nameBn: form.get("nameBn"),
        phone: form.get("phone"),
        email: form.get("email"),
        isActive: form.get("isActive") === "on",
      };
      await apiFetch(`${API}/api/v1/users/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": getTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      router.replace("/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="h-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error || "User not found"}</p>
            <Button asChild onClick={() => router.replace("/users")}>
              <Link href="/users">Back to Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update user details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.nameEn}
          </CardTitle>
          <CardDescription>Changes are saved immediately</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={user.nameEn}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameBn">Name (বাংলা)</Label>
                <Input id="nameBn" name="nameBn" defaultValue={user.nameBn || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ""} />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked={user.isActive !== false}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isActive" className="text-sm">
                Active
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.replace("/users")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
