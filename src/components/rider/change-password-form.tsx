"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeRiderPassword } from "@/actions/rider-settings";
import { t, type Lang } from "@/lib/i18n";

/** Rider 更换密码（Settings → Security）：当前密码校验 + 新密码更新（Supabase）。 */
export function ChangePasswordForm({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = next !== confirm && confirm.length > 0;
  const canSubmit = current.length > 0 && next.length >= 8 && next === confirm;

  const submit = () =>
    start(async () => {
      const r = await changeRiderPassword({ currentPassword: current, newPassword: next });
      if (r.ok) {
        toast.success(t("password.changed", lang));
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        toast.error(r.error);
      }
    });

  return (
    <div className="space-y-3">
      <div>
        <Label>{t("password.current", lang)}</Label>
        <Input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="mt-1.5"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <div>
        <Label>{t("password.new", lang)}</Label>
        <Input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="mt-1.5"
          placeholder={t("password.min-hint", lang)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label>{t("password.confirm", lang)}</Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1.5"
          placeholder={t("password.confirm", lang)}
          autoComplete="new-password"
        />
      </div>
      {mismatch && <p className="text-xs text-destructive">{t("password.mismatch", lang)}</p>}
      <Button className="w-full" disabled={pending || !canSubmit} onClick={submit}>
        {pending ? t("common.loading", lang) : t("password.change", lang)}
      </Button>
    </div>
  );
}
