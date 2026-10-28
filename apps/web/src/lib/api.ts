import { Language } from "./config";

export function getApiHeaders(language: Language, tenantId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Language": language,
  };
  if (tenantId) {
    headers["X-Tenant-ID"] = tenantId;
  }
  return headers;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { language?: Language; tenantId?: string },
) {
  const { language = "en", tenantId, ...rest } = init ?? {};
  const res = await fetch(input, {
    ...rest,
    headers: { ...getApiHeaders(language, tenantId), ...rest?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tenantId");
        window.location.href = "/login";
      }
    }
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}
