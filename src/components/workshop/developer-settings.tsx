"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Database, RefreshCcw, X } from "lucide-react";
import {
  verifyDeveloperPassword, clearDeveloperSession, setModuleAccess, resetModuleAccess,
  applyFirstWavePreset, resetBusinessData,
} from "@/actions/developer";

/** 密码门禁表单（sudo 式：验证 Owner 密码后解锁 15 分钟）。 */
export function DeveloperGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, start] = useTransition();

  return (
    <div className="rounded-2xl border bg-card p-6 max-w-md">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Lock className="h-4 w-4 text-primary" /> Developer access is locked
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Enter your password to unlock the developer settings (valid 15 minutes).</p>
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
          placeholder="Your password"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
          {busy ? "Verifying…" : "Unlock"}
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
      setPresetMsg(r.ok ? "First-wave preset applied (" + r.rows + " rows closed)." : r.error);
      router.refresh();
    });
  };
  const doReset = () => {
    start(async () => {
      const r = await resetBusinessData();
      if (r.ok) {
        setPresetMsg("Business data cleared: " + Object.values(r.counts).reduce((s, n) => s + n, 0) + " records removed.");
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
          Unlocked · changes take effect immediately (nav hides + URL blocked)
        </div>
        <button
          type="button"
          onClick={() => { start(async () => { await clearDeveloperSession(); router.refresh(); }); }}
          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent"
        >
          <X className="h-3 w-3" /> Lock
        </button>
      </div>

      {/* 数据概览 */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Database className="h-4 w-4 text-primary" /> Data overview</h2>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
          {[["Customers", totalCustomers], ["Jobs", overview?.jobs ?? 0], ["Bookings", overview?.bookings ?? 0], ["Invoices", overview?.invoices ?? 0]].map(([l, v]) => (
            <div key={l as string} className="rounded-lg bg-muted/50 p-2">
              <div className="text-lg font-bold tabular-nums">{v}</div>
              <div className="text-[10px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={preset} disabled={busy} className="rounded-md bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 disabled:opacity-50">
            Apply first-wave preset (open 13 / close 15)
          </button>
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)} disabled={busy} className="rounded-md border border-destructive/40 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 disabled:opacity-50">
              Clear business data…
            </button>
          ) : (
            <span className="flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-1.5 text-xs">
              <span className="text-destructive">Keep config, delete {totalCustomers} customers + all bookings/jobs/invoices/reminders?</span>
              <button type="button" onClick={doReset} disabled={busy} className="rounded bg-destructive text-destructive-foreground px-2 py-0.5 font-medium">Yes, clear</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="rounded border px-2 py-0.5 hover:bg-accent">Cancel</button>
            </span>
          )}
        </div>
        {presetMsg && <p className="mt-2 text-xs text-muted-foreground">{presetMsg}</p>}
      </div>

      {/* 角色×模块矩阵 */}
      <div className="rounded-2xl border bg-card p-4 overflow-x-auto">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Module access matrix (role × module)</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">Toggle which modules each role can access. Off = nav hidden + URL blocked. Dotted = overridden from default.</p>
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-medium sticky left-0 bg-card">Module</th>
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
                        title={(on ? "On" : "Off") + (overridden ? " (overridden)" : " (default)")}
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
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-muted" /> Off</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> On</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full ring-1 ring-amber-400" /> Overridden from default</span>
          <button type="button" className="text-primary hover:underline" onClick={() => { start(async () => { for (const m of modules) for (const r of roles) if (m.overridden[r]) await resetModuleAccess(r, m.key); router.refresh(); }); }}>
            Reset all overrides
          </button>
        </div>
      </div>
    </div>
  );
}
