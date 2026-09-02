import { db } from "@/lib/db";
import { loyaltyModule } from "@/modules/loyalty/service";
import { referralModule } from "@/modules/referrals/service";
import { LoyaltyManager } from "@/components/workshop/loyalty-manager";
import { ReferralManager } from "@/components/workshop/referral-manager";
import { fmtDateTime } from "@/lib/format";
import { PendingForm } from "@/components/shared/search-form";
import { getLang } from "@/lib/get-lang";
import { t, tpl } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LoyaltyPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const [accounts, rewards, referrals] = await Promise.all([
    loyaltyModule.list(org!.id, sp.q),
    db.reward.findMany({ where: { organisationId: org!.id }, orderBy: { pointsRequired: "asc" } }),
    referralModule.list(org!.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("loyal.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{tpl("loyal.subtitle", lang, { n: accounts.length })}</p>
      </div>

      <LoyaltyManager rewards={rewards.map((r) => ({ id: r.id, name: r.name, pointsRequired: r.pointsRequired, active: r.active }))} />

      <div className="rounded-xl border bg-card overflow-hidden">
        <h2 className="font-semibold text-sm px-4 pt-3 pb-2">{tpl("loyal.members", lang, { n: accounts.length })}</h2>
        <PendingForm className="px-4 pb-3">
          <input name="q" defaultValue={sp.q} placeholder={t("loyal.search-member", lang)} className="w-full max-w-sm rounded-md border bg-background px-3 py-1.5 text-sm" />
        </PendingForm>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2 font-medium">{t("loyal.col-member", lang)}</th><th className="px-4 py-2 font-medium">{t("loyal.col-tier", lang)}</th><th className="px-4 py-2 font-medium">{t("loyal.col-points", lang)}</th><th className="px-4 py-2 font-medium">{t("loyal.col-since", lang)}</th><th className="px-4 py-2 font-medium">{t("loyal.col-ledger", lang)}</th></tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{a.customer.name}<div className="text-xs text-muted-foreground">{a.membershipId}</div></td>
                <td className="px-4 py-2.5"><span className="rounded-full bg-primary/10 text-primary text-[11px] px-2.5 py-0.5">{a.tier?.name ?? "—"}</span></td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{a.pointsBalance}</td>
                <td className="px-4 py-2.5 text-xs">{a.memberSince.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-2.5">
                  <details>
                    <summary className="text-xs text-primary cursor-pointer">{tpl("loyal.transactions", lang, { n: a.transactions.length })}</summary>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {a.transactions.map((t) => (
                        <div key={t.id} className="text-[11px] text-muted-foreground flex justify-between gap-4">
                          <span>{t.type} · {t.reason}</span>
                          <span className={t.points > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-destructive"}>{t.points > 0 ? "+" : ""}{t.points} → {t.balanceAfter}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("loyal.empty", lang)}</td></tr>}
          </tbody>
        </table>
      </div>

      <ReferralManager referrals={referrals.map((r) => ({ id: r.id, code: r.code, status: r.status, referrer: r.referringCustomer.name, referred: r.referredCustomer?.name ?? "—", createdAt: r.createdAt }))} />
    </div>
  );
}
