"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginShell } from "@/components/login/login-shell";
import { signInWithPassword } from "@/actions/auth-supabase";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { COUNTRY_CODES } from "@/lib/phone";

type Tab = "phone" | "email";

/** Rider 专属登录页：顾客入口（与 workshop /login 分离）。 */
export default function RiderLoginPage() {
  const router = useRouter();
  const lang = useLang();
  const [tab, setTab] = useState<Tab>("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+60"); // 手机号区号（默认马来西亚）
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function doLogin(identifier: string, cc: string) {
    setBusy(true); setError(""); setInfo("");
    const res = await signInWithPassword({ identifier, countryCode: cc, password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    router.push(res.hasBike === false ? "/rider/bike-first" : "/rider/home");
    router.refresh();
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";
  const tabCls = (active: boolean) => `flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`;

  return (
    <LoginShell
      app="rider"
      eyebrow={t("login.badge.rider", lang)}
      title={t("login.title.rider", lang)}
      tagline={t("rider.login-sub", lang)}
      footer={
        <>
          <p className="text-xs">{t("login.role_customer", lang)}</p>
          <p className="text-xs">
            <a href="/rider/signup" className="font-medium text-primary hover:underline">{t("login.new-here", lang)}</a>
            {" · "}
            {tpl("login.need", lang, { app: t("login.badge.mechanic", lang) })}{" "}
            <a href="/mechanic-app/login" className="font-medium text-primary hover:underline">{t("login.link_mechanic", lang)}</a>
          </p>
          <p className="text-xs">
            {t("rider.staff-line", lang)}{" "}
            <a href="/login" className="font-medium text-primary hover:underline">{t("rider.workshop-signin", lang)}</a>
          </p>
        </>
      }
    >
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        <button type="button" className={tabCls(tab === "phone")} onClick={() => { setTab("phone"); setError(""); setInfo(""); }}>{t("login.phone", lang)}</button>
        <button type="button" className={tabCls(tab === "email")} onClick={() => { setTab("email"); setError(""); setInfo(""); }}>{t("login.email", lang)}</button>
      </div>

      {error && <p className="mb-3 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}
      {info && <p className="mb-3 rounded-md bg-primary/10 text-primary text-sm px-3 py-2">{info}</p>}

      {tab === "phone" && (
        <form onSubmit={(e) => { e.preventDefault(); doLogin(phone, countryCode); }} className="space-y-3">
          <div>
            <label className={labelCls}>{t("login.phone", lang)}</label>
            <div className="flex gap-2">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-32 rounded-md border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input className={inputCls} type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("login.ph-phone", lang)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("login.password-tab", lang)}</label>
            <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
            {busy ? t("login.signing-in", lang) : t("login.signin", lang)}
          </button>
        </form>
      )}

      {tab === "email" && (
        <form onSubmit={(e) => { e.preventDefault(); doLogin(email, "+60"); }} className="space-y-3">
          <div>
            <label className={labelCls}>{t("common.email", lang)}</label>
            <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.ph-email", lang)} />
          </div>
          <div>
            <label className={labelCls}>{t("login.password-tab", lang)}</label>
            <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
            {busy ? t("login.signing-in", lang) : t("login.signin", lang)}
          </button>
        </form>
      )}
    </LoginShell>
  );
}
