"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkIn, checkOut } from "@/actions/attendance";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { fmtTime } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export interface MechanicStatus {
  id: string;
  name: string;
  checkInAt: string | null;
  checkOutAt: string | null;
}

/** 考勤面板：自己的打卡按钮 + 全员可用状态列表（ON DUTY 置顶）。 */
export function AttendancePanel({ mechanics, currentUserId, lang }: { mechanics: MechanicStatus[]; currentUserId: string; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const me = mechanics.find((m) => m.id === currentUserId);
  const lastIn = me && me.checkInAt ? new Date(me.checkInAt) : null;
  const lastOut = me && me.checkOutAt ? new Date(me.checkOutAt) : null;
  const onDuty = !!lastIn && (!lastOut || lastIn > lastOut); // 最后动作判定
  const today = new Date();

  const doCheckIn = () => start(async () => {
    const r = await checkIn();
    if (r.ok) { toast.success(tpl("att.checked-in-at", lang, { time: r.checkInAt ? fmtTime(r.checkInAt) : "" })); router.refresh(); }
    else toast.error(r.error);
  });
  const doCheckOut = () => start(async () => {
    const r = await checkOut();
    if (r.ok) { toast.success(t("att.checked-out", lang)); router.refresh(); }
    else toast.error(r.error);
  });

  const sorted = [...mechanics].sort((a, b) => {
    const aOn = a.checkInAt && (!a.checkOutAt || new Date(a.checkInAt) > new Date(a.checkOutAt)) ? 1 : 0;
    const bOn = b.checkInAt && (!b.checkOutAt || new Date(b.checkInAt) > new Date(b.checkOutAt)) ? 1 : 0;
    if (aOn !== bOn) return bOn - aOn;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      {/* 我的打卡 */}
      {me && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{me.name} <span className="text-xs text-muted-foreground">{t("att.you", lang)}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {onDuty ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t("att.on-duty", lang)}</span> : me.checkInAt ? t("att.checked-out", lang) : t("att.not-checked", lang)}
              </div>
            </div>
            {onDuty ? (
              <Button size="sm" variant="outline" disabled={pending} onClick={doCheckOut}><LogOut className="h-3.5 w-3.5 mr-1.5" />{t("att.check-out", lang)}</Button>
            ) : (
              <Button size="sm" disabled={pending} onClick={doCheckIn}><LogIn className="h-3.5 w-3.5 mr-1.5" />{t("att.check-in", lang)}</Button>
            )}
          </div>
        </div>
      )}

      {/* 全员可用状态 */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="font-semibold">{t("att.title", lang)}</div>
          <div className="text-xs text-muted-foreground">{t("att.subtitle", lang)}</div>
        </div>
        {sorted.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t("att.no-mechanics", lang)}</div>}
        <div className="divide-y divide-border/60">
          {sorted.map((m) => {
            const on = !!m.checkInAt && (!m.checkOutAt || new Date(m.checkInAt) > new Date(m.checkOutAt));
            return (
              <div key={m.id} className={"flex items-center gap-3 px-4 py-3 " + (on ? "" : "opacity-70")}>
                <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.name}{m.id === currentUserId ? " (" + t("att.you", lang) + ")" : ""}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {on ? tpl("att.checked-in-at", lang, { time: fmtTime(new Date(m.checkInAt!)) }) : m.checkInAt && m.checkOutAt ? tpl("att.checked-out-at", lang, { time: fmtTime(new Date(m.checkOutAt)) }) : t("att.not-checked", lang)}
                  </div>
                </div>
                <span className={"shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold " + (on ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                  {on ? t("att.on-duty", lang) : t("att.checked-out", lang)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
