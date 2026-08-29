"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bike, CheckCheck, ChevronRight, MapPin } from "lucide-react";
import { transitionJob } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";

export interface OrderCard {
  id: string;
  jobNumber: string;
  status: string;
  customer: string;
  brand: string;
  model: string;
  plate: string;
  city: string;
  bookingDate: string | null;
  bookingTime: string | null;
  amountSen: number;
  packageName: string | null;
}

/** Grab 风格订单卡：金额醒目 + 接单（WAITING → IN_PROGRESS）。 */
export function JobCard({ order }: { order: OrderCard }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const canAccept = order.status === "WAITING";

  const accept = () =>
    start(async () => {
      const r = await transitionJob(order.id, "IN_PROGRESS");
      if (r.ok) { toast.success(t("mech.accepted", lang)); router.refresh(); }
      else {
        // SOP-001: 开工前需先拍齐 5 张照片——引导到工单详情页拍照
        toast.error(r.error ?? t("toast.failed", lang));
        router.push("/mechanic-app/jobs/" + order.id);
      }
    });

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-primary">{order.jobNumber}</span>
            {order.packageName && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{order.packageName}</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            <Bike className="h-4 w-4 shrink-0 text-muted-foreground" />
            {order.brand} {order.model} <span className="font-mono text-xs text-muted-foreground">{order.plate}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{order.customer}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {order.city}
            {order.bookingDate && <span>· {order.bookingDate} {order.bookingTime ?? ""}</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold tabular-nums text-primary">{formatRM(order.amountSen)}</div>
          <div className="text-[10px] text-muted-foreground">{t("mech.order-label", lang)}</div>
        </div>
      </div>

      <div className="mt-3">
        {canAccept ? (
          <button
            type="button"
            onClick={accept}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> {t("mech.accept", lang)}
          </button>
        ) : (
          <Link href={"/mechanic-app/jobs/" + order.id} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent">
            {t("mech.view-work", lang)} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
