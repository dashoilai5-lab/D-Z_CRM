"use client";

import { useRouter } from "next/navigation";
import { qualifyReferralAction } from "@/actions/loyalty";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function ReferralManager({ referrals }: { referrals: { id: string; code: string; status: string; referrer: string; referred: string; createdAt: Date }[] }) {
  const router = useRouter();
  const lang = useLang();
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <h2 className="font-semibold text-sm px-4 pt-3 pb-2">{t("referral.title", lang)} ({referrals.length})</h2>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr><th className="px-4 py-2 font-medium">{t("referral.col-code", lang)}</th><th className="px-4 py-2 font-medium">{t("referral.col-referrer", lang)}</th><th className="px-4 py-2 font-medium">{t("referral.col-referred", lang)}</th><th className="px-4 py-2 font-medium">{t("common.status", lang)}</th><th className="px-4 py-2 font-medium">{t("ws.po.created", lang)}</th><th className="px-4 py-2"></th></tr>
        </thead>
        <tbody>
          {referrals.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2.5 font-mono text-xs">{r.code}</td>
              <td className="px-4 py-2.5">{r.referrer}</td>
              <td className="px-4 py-2.5 text-xs">{r.referred}</td>
              <td className="px-4 py-2.5 text-xs">{r.status}</td>
              <td className="px-4 py-2.5 text-xs">{r.createdAt.toISOString().slice(0, 10)}</td>
              <td className="px-4 py-2.5 text-right">
                {r.status === "PENDING" && (
                  <button className="text-xs text-primary hover:underline" onClick={async () => { await qualifyReferralAction(r.id); router.refresh(); }}>{t("referral.qualify", lang)}</button>
                )}
              </td>
            </tr>
          ))}
          {referrals.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("referral.empty", lang)}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
