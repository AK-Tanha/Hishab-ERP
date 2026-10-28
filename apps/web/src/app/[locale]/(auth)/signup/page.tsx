"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("tenants");
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg">
              H
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Hishab ERP</h1>
          <p className="text-muted-foreground">{tn("register")}</p>
        </div>
        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("createAccount")}</CardTitle>
            <CardDescription>Create your business account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="businessEn">{tn("businessName")} (English)</Label>
                <Input id="businessEn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessBn">{tn("businessName")} (বাংলা)</Label>
                <Input id="businessBn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">{t("subdomain")}</Label>
                <Input id="subdomain" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" type="password" />
              </div>
              <Button type="button" onClick={(e) => e.preventDefault()} className="w-full">
                {t("createAccount")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t("login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
