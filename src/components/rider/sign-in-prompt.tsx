import Link from "next/link";
import { Bike } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

/** 未登录顾客访问 rider 页时的登录引导（生产模式）。 */
export default function RiderSignInPrompt({ lang }: { lang: Lang }) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Bike className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold">{t("signin.title", lang)}</h2>
      <p className="text-sm text-muted-foreground">{t("signin.sub", lang)}</p>
      <Link href="/rider/login" className="inline-block rounded-md bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90">
        {t("signin.cta", lang)}
      </Link>
      <p className="text-xs text-muted-foreground">
        <Link href="/rider/signup" className="text-primary hover:underline">{t("signin.new", lang)}</Link>
      </p>
    </div>
  );
}
