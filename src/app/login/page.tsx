"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBrandIcon } from "@/components/shared/app-brand-icon";
import { signInWithPassword, signInWithOtp, verifyOtp } from "@/actions/auth-supabase";
import { LanguageSwitcher } from "@/components/rider/language-switcher";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

type LoginMode = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const lang = useLang();
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function doPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    const res = await signInWithPassword({ email, password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    // 按角色跳转：MECHANIC → mechanic app；其他员工 → workshop OS
    router.push(res.role === "MECHANIC" ? "/mechanic-app" : "/workshop/dashboard");
    router.refresh();
  }

  async function doSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    const res = await signInWithOtp({ email });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setOtpSent(true);
    setInfo(t("pub.login.otp_sent", lang));
  }

  async function doVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await verifyOtp({ email, token: otpToken });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    router.push("/rider/home");
    router.refresh();
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";
  const tabCls = (active: boolean) => `flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" aria-hidden />
      <div className="w-full max-w-sm relative">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher current={lang} />
        </div>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <AppBrandIcon app="workshop" className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">D&Z AI CRM</h1>
          <p className="text-sm text-muted-foreground">{t("pub.login.tagline", lang)}</p>
        </div>
        <div className="rounded-2xl border bg-card/95 backdrop-blur p-6 shadow-xl shadow-black/5">
          <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
            <button type="button" className={tabCls(loginMode === "password")} onClick={() => { setLoginMode("password"); setError(""); setInfo(""); }}>{t("pub.login.tab_password", lang)}</button>
            <button type="button" className={tabCls(loginMode === "otp")} onClick={() => { setLoginMode("otp"); setError(""); setInfo(""); }}>{t("pub.login.tab_email_code", lang)}</button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{t("pub.login.heading", lang)}</p>

          {error && <p className="mb-3 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}
          {info && <p className="mb-3 rounded-md bg-primary/10 text-primary text-sm px-3 py-2">{info}</p>}

          {loginMode === "password" && (
            <form onSubmit={doPassword} className="space-y-3">
              <div>
                <label className={labelCls}>{t("common.email", lang)}</label>
                <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dz.my" />
              </div>
              <div>
                <label className={labelCls}>{t("form.password", lang)}</label>
                <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                {busy ? t("pub.login.signing_in", lang) : t("pub.login.sign_in", lang)}
              </button>
            </form>
          )}

          {loginMode === "otp" && !otpSent && (
            <form onSubmit={doSendOtp} className="space-y-3">
              <div>
                <label className={labelCls}>{t("common.email", lang)}</label>
                <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dz.my" />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-md border py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
                {busy ? t("pub.login.sending", lang) : t("pub.login.send_code", lang)}
              </button>
            </form>
          )}

          {loginMode === "otp" && otpSent && (
            <form onSubmit={doVerifyOtp} className="space-y-3">
              <div>
                <label className={labelCls}>{t("form.otp_code", lang)}</label>
                <input className={inputCls} inputMode="numeric" required value={otpToken} onChange={(e) => setOtpToken(e.target.value)} placeholder="123456" />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                {busy ? t("pub.login.verifying", lang) : t("pub.login.verify_continue", lang)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
