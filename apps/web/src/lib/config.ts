export const appConfig = {
  name: "Hishab",
  currency: "BDT",
  locales: ["en", "bn"],
  defaultLocale: "en",
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Language = "en" | "bn";
