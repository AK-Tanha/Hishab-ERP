"use client";

import { useTranslations } from "next-intl";

export default function PlaceholderPage({ title }: { title: string }) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground">{t("noData")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{title} module coming in next phase.</p>
    </div>
  );
}
