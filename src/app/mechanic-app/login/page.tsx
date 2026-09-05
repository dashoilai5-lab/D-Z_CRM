"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginShell } from "@/components/login/login-shell";
import { signInWithPassword } from "@/actions/auth-supabase";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

/** Mechanic App 专属登录页：技师入口（与 workshop /login 分开，独立配色与字眼）。 */
export default function MechanicLoginPage() {
  const router = useRouter();
  const lang = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function doPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await signInWithPassword({ email, password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    router.push(res.role === "MECHANIC" ? "/mechanic-app" : "/workshop/dashboard");
    router.refresh();
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <LoginShell
      app="mechanic"
      eyebrow={t("login.badge.mechanic", lang)}
      title={t("login.title.mechanic", lang)}
      tagline={t("login.tagline.mechanic", lang)}
      footer={
        <>
          <p className="text-xs">{t("login.role_mechanic", lang)}</p>
          <p className="text-xs">
            {tpl("login.need", lang, { app: t("login.badge.workshop", lang) })}{" "}
            <a href="/login" className="font-medium text-primary hover:underline">{t("login.link_workshop", lang)}</a>
            {" · "}
            {tpl("login.need", lang, { app: t("login.badge.rider", lang) })}{" "}
            <a href="/rider/login" className="font-medium text-primary hover:underline">{t("login.link_rider", lang)}</a>
          </p>
        </>
      }
    >
      <p className="text-sm text-muted-foreground mb-5">{t("pub.login.heading", lang)}</p>

      {error && <p className="mb-3 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}

      <form onSubmit={doPassword} className="space-y-3">
        <div>
          <label className={labelCls}>{t("common.email", lang)}</label>
          <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dz.my" />
        </div>
        <div>
          <label className={labelCls}>{t("form.password", lang)}</label>
          <input className={inputCls} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
          {busy ? t("pub.login.signing_in", lang) : t("pub.login.sign_in", lang)}
        </button>
      </form>
    </LoginShell>
  );
}
