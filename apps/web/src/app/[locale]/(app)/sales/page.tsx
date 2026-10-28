"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";

export default function SalesIndexPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/sales/invoices");
  }, [router]);
  return null;
}
