"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Database, RefreshCcw, X } from "lucide-react";
import {
  verifyDeveloperPassword, clearDeveloperSession, setModuleAccess, resetModuleAccess,
  applyFirstWavePreset, resetBusinessData,
} from "@/actions/developer";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

/** 密码门禁表单（sudo 式：验证 Owner 密码后解锁 15 分钟）。 */
export function DeveloperGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const lang = useLang();

  return (
    <div className="rounded-2xl border bg-card p-6 max-w-md">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Lock className="h-4 w-4 text-primary" /> {t("dev.access-locked", lang)}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("dev.access-locked-desc", lang)}</p>
      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          start(async () => {
            const r = await verifyDeveloperPassword(password);
            if (!r.ok) { setError(r.error); return; }
            router.refresh();
          });
        }}
      >
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("dev.password-placeholder", lang)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
          {busy ? t("dev.verifying", lang) : t("dev.unlock", lang)}
        </button>
      </form>
    </div>
  );
}

interface ModuleRow {
  key: string;
  defaultFor: Record<string, boolean>;
  effective: Record<string, boolean>;
  overridden: Record<string, boolean>;
}

/** Developer Settings 主面板：数据概览 + 角色×模块矩阵 + 数据管理。 */
export function DeveloperSettingsPanel({ roles, modules, overview }: { roles: string[]; modules: ModuleRow[]; overview?: Record<string, number> }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const lang = useLang();
  const [confirmReset, setConfirmReset] = useState(false);
  const [presetMsg, setPresetMsg] = useState("");

  const toggle = (role: string, mod: string, effective: boolean) => {
    start(async () => {
      const r = await setModuleAccess(role, mod, !effective);
      if (!r.ok) return;
      router.refresh();
    });
  };
  const resetOne = (role: string, mod: string) => {
    start(async () => {
      await resetModuleAccess(role, mod);
      router.refresh();
    });
  };
  const preset = () => {
    start(async () => {
      const r = await applyFirstWavePreset();
      setPresetMsg(r.ok ? tpl("dev.preset-applied", lang, { rows: r.rows }) : r.error);
      router.refresh();
    });
  };
  const doReset = () => {
    start(async () => {
      const r = await resetBusinessData();
      if (r.ok) {
        const clearedCount = Object.values(r.counts).reduce((s, x) => s + x, 0);
        setPresetMsg(tpl("dev.data-cleared", lang, { n: clearedCount }));
        setConfirmReset(false);
      }
      router.refresh();
    });
  };

  const totalCustomers = overview?.customers ?? 0;

  return (
    <div className="space-y-6">
      {/* 顶部：退出 + 数据概览 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          {t("dev.unlocked-note", lang)}
        </div>
        <button
          type="button"
          onClick={() => { start(async () => { await clearDeveloperSession(); router.refresh(); }); }}
          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent"
        >
          <X className="h-3 w-3" /> {t("dev.lock", lang)}
        </button>
      </div>

      {/* 数据概览 */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Database className="h-4 w-4 text-primary" /> {t("dev.data-overview", lang)}</h2>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
          {[[t("dev.stat-customers", lang), totalCustomers], [t("dev.stat-jobs", lang), overview?.jobs ?? 0], [t("dev.stat-bookings", lang), overview?.bookings ?? 0], [t("dev.stat-invoices", lang), overview?.invoices ?? 0]].map(([l, v]) => (
            <div key={l as string} className="rounded-lg bg-muted/50 p-2">
              <div className="text-lg font-bold tabular-nums">{v}</div>
              <div className="text-[10px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={preset} disabled={busy} className="rounded-md bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 disabled:opacity-50">
            {t("dev.apply-preset", lang)}
          </button>
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)} disabled={busy} className="rounded-md border border-destructive/40 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 disabled:opacity-50">
              {t("dev.clear-data", lang)}
            </button>
          ) : (
            <span className="flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-1.5 text-xs">
              <span className="text-destructive">{tpl("dev.clear-confirm", lang, { n: totalCustomers })}</span>
              <button type="button" onClick={doReset} disabled={busy} className="rounded bg-destructive text-destructive-foreground px-2 py-0.5 font-medium">{t("dev.yes-clear", lang)}</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="rounded border px-2 py-0.5 hover:bg-accent">{t("common.cancel", lang)}</button>
            </span>
          )}
        </div>
        {presetMsg && <p className="mt-2 text-xs text-muted-foreground">{presetMsg}</p>}
      </div>

      {/* 角色×模块矩阵 */}
      <div className="rounded-2xl border bg-card p-4 overflow-x-auto">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> {t("dev.matrix-title", lang)}</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">{t("dev.matrix-desc", lang)}</p>
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-medium sticky left-0 bg-card">{t("dev.module-header", lang)}</th>
              {roles.map((r) => <th key={r} className="px-1.5 py-1.5 font-medium whitespace-nowrap">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.key} className="border-t">
                <td className="py-1.5 pr-3 font-medium whitespace-nowrap sticky left-0 bg-card">
                  {m.key}
                  {Object.values(m.overridden).some(Boolean) && <span className="ml-1 text-[9px] text-amber-500">•</span>}
                </td>
                {roles.map((r) => {
                  const on = m.effective[r];
                  const overridden = m.overridden[r];
                  return (
                    <td key={r} className="px-1.5 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(r, m.key, on)}
                        disabled={busy}
                        title={(on ? t("dev.on", lang) : t("dev.off", lang)) + (overridden ? " (" + t("dev.overridden", lang) + ")" : " (" + t("dev.default", lang) + ")")}
                        className={"inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 " + (on ? "bg-emerald-500 justify-end" : "bg-muted justify-start")}
                      >
                        <span className={"h-4 w-4 rounded-full bg-background shadow " + (overridden ? "ring-1 ring-amber-400" : "")} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-muted" /> {t("dev.off", lang)}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> {t("dev.on", lang)}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full ring-1 ring-amber-400" /> {t("dev.overridden-default", lang)}</span>
          <button type="button" className="text-primary hover:underline" onClick={() => { start(async () => { for (const m of modules) for (const r of roles) if (m.overridden[r]) await resetModuleAccess(r, m.key); router.refresh(); }); }}>
            {t("dev.reset-overrides", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
