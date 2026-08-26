import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { SettingsForm } from "@/components/mechanic/settings-form";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** Mechanic Settings（参考 rider app）：编辑资料 + 语言切换。 */
export default async function MechanicSettingsPage() {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true, email: true } });
  if (!user) redirect("/mechanic-app");

  return (
    <div className="space-y-4">
      <Link href="/mechanic-app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> {t("settings.title", lang)}
      </Link>
      <h1 className="text-xl font-bold">{t("settings.title", lang)}</h1>
      <SettingsForm name={user.name} phone={user.phone} email={user.email} lang={lang} />
    </div>
  );
}
