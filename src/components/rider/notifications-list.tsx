"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CalendarClock, Megaphone, MessageSquare, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "@/actions/rider";

const TYPE_ICON: Record<string, { icon: typeof Info; cls: string }> = {
  REMINDER: { icon: CalendarClock, cls: "bg-amber-100 text-amber-700" },
  APPROVAL: { icon: MessageSquare, cls: "bg-blue-100 text-blue-700" },
  PROMO: { icon: Megaphone, cls: "bg-purple-100 text-purple-700" },
  INFO: { icon: Info, cls: "bg-slate-100 text-slate-600" },
};

export interface RiderNotification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  readAt: Date | null;
  createdAt: Date;
}

export function NotificationsList({ customerId, notifications }: { customerId: string; notifications: RiderNotification[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const unread = notifications.filter((n) => !n.readAt).length;

  const markAll = () =>
    start(async () => {
      await markNotificationsRead(customerId);
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread > 0 && (
          <button onClick={markAll} disabled={pending} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No notifications yet.</p>}

      <div className="space-y-2">
        {notifications.map((n) => {
          const meta = TYPE_ICON[n.type] ?? TYPE_ICON.INFO;
          return (
            <div key={n.id} className={cn("flex gap-3 rounded-2xl border bg-card p-4", !n.readAt && "ring-1 ring-primary/30")}>
              <div className={cn("h-9 w-9 shrink-0 rounded-xl flex items-center justify-center", meta.cls)}>
                <meta.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{n.title}</span>
                  {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </div>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                <div className="mt-1 text-[10px] text-muted-foreground/70">
                  {n.createdAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })} · {n.createdAt.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
        <BellRing className="h-3.5 w-3.5" /> {unread} unread
      </div>
    </div>
  );
}
