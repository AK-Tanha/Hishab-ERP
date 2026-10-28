"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { canAccessNavItem, getUserRoles, getUserPermissions } from "@/lib/role-access";

type PageGuardProps = {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: "owner" | "admin" | "accountant" | "sales" | "storekeeper";
  redirectTo?: string;
};

export function PageGuard({
  children,
  requiredPermission,
  requiredRole,
  redirectTo = "/dashboard",
}: PageGuardProps) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (requiredPermission && !canAccessNavItem({ requiredPermission })) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRole && !getUserRoles().includes(requiredRole)) {
      router.replace(redirectTo);
      return;
    }
    setReady(true);
  }, [router, requiredPermission, requiredRole, redirectTo]);

  if (!ready) return null;
  return <>{children}</>;
}

export function usePageAccess(requiredPermission?: string, requiredRole?: "owner" | "admin" | "accountant" | "sales" | "storekeeper") {
  const roles = getUserRoles();
  const perms = getUserPermissions();
  const hasAccess = (!requiredPermission || canAccessNavItem({ requiredPermission })) &&
    (!requiredRole || roles.includes(requiredRole));
  return { hasAccess, roles, permissions: perms };
}
