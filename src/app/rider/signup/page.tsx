"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike } from "lucide-react";
import { signUpRider } from "@/actions/auth-supabase";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** Rider 顾客自助注册页。 */
export default function RiderSignupPage() {
  const router = useRouter();
  const lang = useLang();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // 手机号或邮箱
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    const res = await signUpRider({ name, identifier, password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    if (res.signInFailed) {
      // 账号已建，但自动登录失败（如 phone-only 需 Supabase Phone provider）——引导手动登录
      setInfo("Account created! Sign in with your " + (res.signInFailed.includes("phone") || res.signInFailed.includes("Phone") ? "phone number" : "email") + " and password.");
      return;
    }
    if (res.emailConfirm) {
      setInfo("Account created! Check your email for a confirmation link, then sign in.");
    } else {
      router.push("/rider/home");
      router.refresh();
    }
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="flex justify-center px-4 py-4 relative overflow-hidden">
      <div className="w-full max-w-sm relative">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <Bike className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("signup.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{t("signup.sub", lang)}</p>
        </div>
        <div className="rounded-2xl border bg-card/95 backdrop-blur p-6 shadow-xl shadow-black/5">
          {error && <p className="mb-3 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}
          {info && <p className="mb-3 rounded-md bg-primary/10 text-primary text-sm px-3 py-2">{info}</p>}
          <form onSubmit={doSignup} className="space-y-3">
            <div>
              <label className={labelCls}>{t("signup.full-name", lang)}</label>
              <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className={labelCls}>{t("login.phone-or-email", lang)}</label>
              <input className={inputCls} type="text" inputMode="tel" autoComplete="tel" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="012-345 6789 / you@example.com" />
            </div>
            <div>
              <label className={labelCls}>{t("signup.password-min", lang)}</label>
              <input className={inputCls} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
              {busy ? t("signup.creating", lang) : t("signup.create", lang)}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <a href="/rider/login" className="text-primary hover:underline">{t("signup.has-account", lang)}</a>
        </p>
      </div>
    </div>
  );
}
