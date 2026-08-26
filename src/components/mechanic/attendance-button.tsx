"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut } from "lucide-react";
import { checkIn, checkOut } from "@/actions/attendance";
import { t, tpl } from "@/lib/i18n";
import { fmtTime } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

/** Mechanic 打卡按钮（与 workshop OS 考勤同步）。 */
export function AttendanceButton({ status, lang }: { status: { state: "ON_DUTY" | "OFF" | "NOT_CHECKED"; checkInAt: string | null; checkOutAt: string | null }; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const doCheckIn = () => start(async () => {
    const r = await checkIn();
    if (r.ok) { toast.success(t("mech.checked-in", lang)); router.refresh(); }
    else toast.error(r.error);
  });
  const doCheckOut = () => start(async () => {
    const r = await checkOut();
    if (r.ok) { toast.success(t("mech.checked-out", lang)); router.refresh(); }
    else toast.error(r.error);
  });

  return (
    <div>
      <div className="text-[11px] text-muted-foreground">
        {status.state === "ON_DUTY" && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tpl("mech.on-duty", lang, { time: status.checkInAt ? fmtTime(new Date(status.checkInAt)) : "" })}</span>}
        {status.state === "OFF" && status.checkOutAt && <span>{tpl("mech.checked-out-at", lang, { time: fmtTime(new Date(status.checkOutAt)) })}</span>}
        {status.state === "NOT_CHECKED" && <span>{t("mech.not-checked", lang)}</span>}
      </div>
      <div className="mt-2">
        {status.state === "ON_DUTY" ? (
          <button type="button" onClick={doCheckOut} disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold text-foreground transition-colors hover:bg-accent disabled:opacity-50">
            <LogOut className="h-4 w-4" /> {t("mech.check-out", lang)}
          </button>
        ) : (
          <button type="button" onClick={doCheckIn} disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            <LogIn className="h-4 w-4" /> {t("mech.check-in", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
