"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { mechanicApprovePayout } from "@/actions/payouts";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate } from "@/lib/format";

export interface PendingPayout {
  id: string;
  period: string;
  periodStart: string;
  totalSen: number;
}

/** Mechanic 同意收款（双向确认第 1 步）：PENDING → Approve → 等 workshop 最终 agree。 */
export function EarningsConfirm({ payouts }: { payouts: PendingPayout[] }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();

  const approve = (id: string) =>
    start(async () => {
      const r = await mechanicApprovePayout(id);
      if (r.ok) { toast.success(t("mech.approved", lang)); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <>
      {payouts.map((p) => (
        <div key={p.id} className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{p.period} · {fmtDate(new Date(p.periodStart))}</div>
              <div className="text-xs text-muted-foreground">{t("payout.total", lang)} {formatRM(p.totalSen)}</div>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{t("mech.awaiting-approval", lang)}</span>
          </div>
          <button
            type="button"
            onClick={() => approve(p.id)}
            disabled={pending}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <BadgeCheck className="h-4 w-4" /> {tpl("mech.approve-payment", lang, { n: formatRM(p.totalSen) })}
          </button>
        </div>
      ))}
    </>
  );
}
