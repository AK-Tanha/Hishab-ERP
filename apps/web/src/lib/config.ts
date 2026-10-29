export const appConfig = {
  name: "Hishab",
  currency: "BDT",
  locales: ["en", "bn"],
  defaultLocale: "en",
};

// Base URL for API calls from the browser.
// - Local dev: falls back to http://localhost:3001 (or .env value).
// - Production (e.g. Vercel): empty string → relative /api/v1/... URLs, which
//   hit the same origin and are routed to the API service by the /api rewrite
//   in vercel.json. Set NEXT_PUBLIC_API_URL only to point at another origin.
export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

export type Language = "en" | "bn";
