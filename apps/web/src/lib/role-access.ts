export type RoleCode = "owner" | "admin" | "accountant" | "sales" | "storekeeper";

interface JwtPayload {
  sub?: string;
  email?: string;
  tenantId?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getUserRoles(): RoleCode[] {
  if (typeof window === "undefined") return [];
  const token = localStorage.getItem("accessToken");
  if (!token) return [];
  const payload = decodeJwt<JwtPayload>(token);
  return ((payload?.roles ?? []) as RoleCode[]).filter(Boolean);
}

export function getUserPermissions(): string[] {
  if (typeof window === "undefined") return [];
  const token = localStorage.getItem("accessToken");
  if (!token) return [];
  const payload = decodeJwt<JwtPayload>(token);
  return payload?.permissions ?? [];
}

export function hasRole(role: RoleCode): boolean {
  return getUserRoles().includes(role);
}

export function hasPermission(permission: string): boolean {
  const perms = getUserPermissions();
  if (perms.includes("*")) return true;
  if (perms.includes(permission)) return true;
  return perms.some((p) => {
    if (p.endsWith(".*")) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix + ".");
    }
    return false;
  });
}

export type NavPermission = {
  requiredPermission?: string;
  requiredRole?: RoleCode;
};

export function canAccessNavItem(item: {
  requiredPermission?: string | string[];
  requiredRole?: RoleCode;
}): boolean {
  if (item.requiredPermission) {
    const perms = Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
    return perms.some((p) => hasPermission(p));
  }
  if (item.requiredRole) {
    return hasRole(item.requiredRole);
  }
  return true;
}
