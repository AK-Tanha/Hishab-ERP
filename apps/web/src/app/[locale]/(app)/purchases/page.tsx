"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";

export default function PurchasesIndexPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/purchases/bills");
  }, [router]);
  return null;
}
