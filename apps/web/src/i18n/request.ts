import { getRequestConfig } from "next-intl/server";
import { en, bn } from "./messages";

export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolved = locale && ["en", "bn"].includes(locale) ? locale : "en";
  const messages = resolved === "bn" ? bn : en;
  return { locale: resolved, messages };
});
