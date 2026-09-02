"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Plus, Minus, Gift, Crown } from "lucide-react";
import { earnPointsAction, adjustPointsAction, redeemRewardAction, searchLoyaltyCustomers, getLoyaltySnapshot } from "@/actions/loyalty";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

type Snapshot = {
  customerId: string;
  customer: { name: string; phone: string | null; email: string | null } | null;
  account: {
    pointsBalance: number; totalEarned: number; totalRedeemed: number; membershipId: string;
    tierName: string | null; tierBenefits: string | null; memberSince: Date;
    recent: { type: string; points: number; balanceAfter: number; reason: string | null; at: Date }[];
  } | null;
};

export function LoyaltyManager({ rewards }: { rewards: { id: string; name: string; pointsRequired: number; active: boolean }[] }) {
  const router = useRouter();
  const lang = useLang();
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string | null; tags: string | null; loyaltyAccount: { pointsBalance: number; membershipId: string } | null }[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [points, setPoints] = useState("100");
  const [reason, setReason] = useState("Adjustment");
  const [rewardId, setRewardId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load(qq: string) {
    setQ(qq);
    if (qq.trim().length < 2) { setCustomers([]); return; }
    const res = await searchLoyaltyCustomers(qq.trim());
    setCustomers(res);
  }

  async function pick(id: string) {
    setBusy(true); setMsg("");
    setCustomers([]);
    const snap = await getLoyaltySnapshot(id);
    setSnapshot(snap ? { customerId: id, ...snap } : null);
    setBusy(false);
    if (snap && !snap.account) setMsg(t("toast.no-loyalty-account", lang));
  }

  /** run an action, then refetch the snapshot so the balance updates live */
  async function act(fn: () => Promise<unknown>, okMsg: string) {
    if (!snapshot) return;
    setBusy(true); setMsg("");
    try {
      await fn();
      const snap = await getLoyaltySnapshot(snapshot.customerId);
      setSnapshot(snap ? { customerId: snapshot.customerId, ...snap } : snapshot);
      setMsg(tpl("toast.balance-updated", lang, { msg: okMsg }));
      setBusy(false);
      router.refresh();
    } catch (e) {
      setBusy(false);
      setMsg((e as Error).message);
    }
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";
  const hasCustomer = !!snapshot?.customerId;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <h2 className="font-semibold text-sm">{t("loyal.actions-title", lang)}</h2>

      {/* step 1 · search & select */}
      <div>
        <label className={labelCls}>{t("loyal.step-search", lang)}</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input className={inputCls + " w-full pl-8"} value={q} onChange={(e) => load(e.target.value)} placeholder={t("loyal.search-hint", lang)} />
        </div>
        {customers.length > 0 && (
          <div className="mt-1.5 rounded-md border max-h-40 overflow-y-auto divide-y">
            {customers.map((c) => (
              <button key={c.id} type="button" className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent/50" onClick={() => pick(c.id)}>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="h-3.5 w-3.5" /></span>
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.phone ?? ""}</span>
                </span>
                {c.loyaltyAccount && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{c.loyaltyAccount.pointsBalance} pts</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* step 2 · selected customer card with current points */}
      {snapshot?.customer && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{snapshot.customer.name}</div>
              <div className="text-xs text-muted-foreground">{snapshot.customer.phone ?? ""}{snapshot.customer.email ? " · " + snapshot.customer.email : ""}</div>
              {snapshot.account && <div className="mt-1 text-[11px] text-muted-foreground font-mono">{snapshot.account.membershipId}</div>}
            </div>
            {snapshot.account ? (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("loyal.current-points", lang)}</div>
                <div className="text-2xl font-bold tabular-nums text-primary">{snapshot.account.pointsBalance}</div>
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Crown className="h-3 w-3" /> {snapshot.account.tierName ?? t("loyal.col-member", lang)}
                </span>
              </div>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t("loyal.no-account", lang)}</span>
            )}
          </div>
          {snapshot.account && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-background p-2"><div className="text-muted-foreground">{t("loyal.earned", lang)}</div><div className="font-semibold tabular-nums">{snapshot.account.totalEarned}</div></div>
              <div className="rounded-lg bg-background p-2"><div className="text-muted-foreground">{t("loyal.redeemed", lang)}</div><div className="font-semibold tabular-nums">{snapshot.account.totalRedeemed}</div></div>
              <div className="rounded-lg bg-background p-2"><div className="text-muted-foreground">{t("loyal.since", lang)}</div><div className="font-semibold">{snapshot.account.memberSince.toISOString().slice(0, 7)}</div></div>
            </div>
          )}
          {snapshot.account && snapshot.account.recent.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-medium text-muted-foreground mb-1">{t("loyal.recent-activity", lang)}</div>
              <div className="space-y-1">
                {snapshot.account.recent.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{t.type} · {t.reason ?? ""}</span>
                    <span className={t.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>{t.points > 0 ? "+" : ""}{t.points} → {t.balanceAfter}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {msg && <p className="mt-2 text-xs text-primary">{msg}</p>}
        </div>
      )}

      {/* step 3 · adjust */}
      <div className="border-t pt-3">
        <label className={labelCls}>{t("loyal.step-adjust", lang)}</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelCls}>{t("loyal.col-points", lang)}</label>
            <input className={inputCls + " w-full"} type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>{t("loyal.reason", lang)}</label>
            <input className={inputCls + " w-full"} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40" disabled={busy || !hasCustomer} onClick={() => act(() => earnPointsAction({ customerId: snapshot!.customerId, points: parseInt(points) || 0, reason: "Manual earn: " + reason }), t("loyal.msg-earned", lang))}>
            <Plus className="h-4 w-4" /> {t("loyal.earn", lang)}
          </button>
          <button className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-40" disabled={busy || !hasCustomer} onClick={() => act(() => adjustPointsAction({ customerId: snapshot!.customerId, delta: -(parseInt(points) || 0), reason: "Adjust: " + reason }), t("loyal.msg-adjusted", lang))}>
            <Minus className="h-4 w-4" /> {t("loyal.adjust-minus", lang)}
          </button>
          <button className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-40" disabled={busy || !hasCustomer} onClick={() => act(() => adjustPointsAction({ customerId: snapshot!.customerId, delta: parseInt(points) || 0, reason: "Adjust: " + reason }), t("loyal.msg-adjusted", lang))}>
            <Plus className="h-4 w-4" /> {t("loyal.adjust-plus", lang)}
          </button>
        </div>
      </div>

      {/* step 4 · redeem */}
      <div className="border-t pt-3">
        <label className={labelCls}>{t("loyal.step-redeem", lang)}</label>
        <div className="flex gap-2">
          <select className={inputCls + " flex-1"} value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
            <option value="">{t("loyal.select-reward", lang)}</option>
            {rewards.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.pointsRequired} pts)</option>)}
          </select>
          <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40" disabled={busy || !hasCustomer || !rewardId} onClick={() => act(() => redeemRewardAction({ customerId: snapshot!.customerId, rewardId }), t("loyal.msg-redeemed", lang))}>
            <Gift className="h-4 w-4" /> {t("loyal.redeem", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
