"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMechanicProfile } from "@/actions/mechanic-profile";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/rider/language-switcher";
import type { Lang } from "@/lib/i18n";

/** Mechanic Settings：编辑个人资料（参考 rider app）+ 语言切换。 */
export function SettingsForm({ name, phone, email, lang }: { name: string; phone: string | null; email: string | null; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [n, setN] = useState(name);
  const [p, setP] = useState(phone ?? "");
  const [e, setE] = useState(email ?? "");

  const save = () =>
    start(async () => {
      const r = await updateMechanicProfile({ name: n, phone: p, email: e });
      if (r.ok) { toast.success(t("toast.saved", lang)); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-semibold mb-3">{t("settings.profile", lang)}</h2>
        <div className="space-y-3">
          <div>
            <Label>{t("common.name", lang)}</Label>
            <Input value={n} onChange={(ev) => setN(ev.target.value)} className="mt-1.5" placeholder="Your name" />
          </div>
          <div>
            <Label>{t("common.phone", lang)}</Label>
            <Input value={p} onChange={(ev) => setP(ev.target.value)} className="mt-1.5" placeholder="e.g. 012-345 6789" inputMode="tel" />
          </div>
          <div>
            <Label>{t("common.email", lang)}</Label>
            <Input type="email" value={e} onChange={(ev) => setE(ev.target.value)} className="mt-1.5" placeholder="you@email.com" />
          </div>
          <Button className="w-full" disabled={pending || !n.trim()} onClick={save}>
            {pending ? t("form.saving", lang) : t("profile.save-changes", lang)}
          </Button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-semibold mb-1">{t("settings.language", lang)}</h2>
        <p className="text-xs text-muted-foreground mb-3">{t("settings.language-desc", lang)}</p>
        <LanguageSwitcher current={lang} />
      </div>
    </div>
  );
}
