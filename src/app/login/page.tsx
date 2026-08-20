"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike } from "lucide-react";
import { login, forgotPassword, resetPassword } from "@/actions/auth";
import { setPersona } from "@/actions/demo";

type Mode = "login" | "forgot" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    const res = await login({ email, password, mfaCode: mfaCode || undefined });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      if (res.mfaRequired) setInfo("Enter your 6-digit authenticator code.");
      return;
    }
    router.push("/workshop/dashboard");
    router.refresh();
  }

  async function doForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    const res = await forgotPassword({ email });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    if (res.devToken) {
      setResetToken(res.devToken);
      setMode("reset");
      setInfo("Dev mode: reset token auto-filled below.");
    } else {
      setInfo("If that email exists, a reset link was sent.");
      setMode("login");
    }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await resetPassword({ token: resetToken, newPassword: password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setMode("login");
    setPassword("");
    setInfo("Password updated. Sign in with your new password.");
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" aria-hidden />
      <div className="w-full max-w-sm relative">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <Bike className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">D&Z AI CRM</h1>
          <p className="text-sm text-muted-foreground">Dealer · Workshop · Rider — one platform</p>
        </div>
        <div className="rounded-2xl border bg-card/95 backdrop-blur p-6 shadow-xl shadow-black/5">
          <p className="text-sm text-muted-foreground mb-5">
            {mode === "login" && "Sign in to your dealer workspace"}
            {mode === "forgot" && "Reset your password"}
            {mode === "reset" && "Choose a new password"}
          </p>

          {error && <p className="mb-3 rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}
          {info && <p className="mb-3 rounded-md bg-primary/10 text-primary text-sm px-3 py-2">{info}</p>}

          {mode === "login" && (
            <form onSubmit={doLogin} className="space-y-3">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@dz.my" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {mfaCode && (
                <div>
                  <label className={labelCls}>MFA Code</label>
                  <input className={inputCls} inputMode="numeric" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" />
                </div>
              )}
              <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="w-full text-center text-xs text-muted-foreground hover:underline">
                Forgot password?
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={doForgot} className="space-y-3">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                Send reset link
              </button>
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full text-center text-xs text-muted-foreground hover:underline">
                Back to sign in
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={doReset} className="space-y-3">
              <div>
                <label className={labelCls}>Reset token</label>
                <input className={inputCls} required value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>New password (min 8 chars)</label>
                <input className={inputCls} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                Update password
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">Demo mode — switch persona without an account:</p>
          <div className="flex gap-2">
            {(["OWNER", "COUNTER_STAFF", "MECHANIC"] as const).map((p) => (
              <button
                key={p}
                className="flex-1 rounded-md border px-2 py-1.5 text-xs font-medium hover:bg-accent"
                onClick={async () => { await setPersona(p); router.push("/workshop/dashboard"); router.refresh(); }}
              >
                {p === "OWNER" ? "Owner" : p === "COUNTER_STAFF" ? "Counter" : "Mechanic"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
