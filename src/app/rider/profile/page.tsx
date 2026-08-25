import Link from "next/link";
import { ChevronRight, MessageCircle, CheckCheck } from "lucide-react";
import { getRiderCustomer } from "@/lib/rider-customer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutIconButton } from "@/components/rider/sign-out-button";
import { initials } from "@/lib/format";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { PageTransition } from "@/components/shared/page-transition";

export const dynamic = "force-dynamic";

export default async function RiderProfilePage() {
  const lang = await getLang();
  const customer = await getRiderCustomer();
  if (!customer) return null;
  const [visits, reviews, notifications, messages, loyalty] = await Promise.all([
    db.serviceJob.count({ where: { customerId: customer.id, status: "COMPLETED" } }),
    db.review.count({ where: { customerId: customer.id } }),
    db.notification.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.message.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.loyaltyAccount.findUnique({ where: { customerId: customer.id }, include: { tier: true } }),
  ]);
  return (
    <PageTransition>
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute right-0 top-0 z-10"><SignOutIconButton /></div>
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto text-xl"><AvatarFallback className="bg-primary/10 text-primary">{initials(customer.name)}</AvatarFallback></Avatar>
          <h1 className="mt-3 text-xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">{customer.phone}{customer.email ? " · " + customer.email : ""}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("rider.member-since", lang)} {customer.joinedAt.getFullYear()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{visits}</div>
          <div className="text-xs text-muted-foreground">{t("rider.profile-services", lang)}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{reviews}</div>
          <div className="text-xs text-muted-foreground">{t("rider.profile-reviews", lang)}</div>
        </div>
      </div>

      {loyalty && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">D&Z Member Card</span>
            <span className="text-[11px] font-mono opacity-80">{loyalty.membershipId}</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold tabular-nums">{loyalty.pointsBalance}</div>
              <div className="text-[11px] opacity-80">loyalty points</div>
            </div>
            <div className="text-right">
              <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{loyalty.tier?.name ?? "Member"}</div>
              <div className="mt-1 text-[10px] opacity-80">{loyalty.tier?.benefits ?? "Earn points on every service"}</div>
            </div>
          </div>
        </div>
      )}

      {messages[0] && (
        <div className="rounded-2xl border bg-emerald-50/70 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-900 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="h-3.5 w-3.5" /> {t("rider.latest-message", lang)}
            </span>
            <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">
              {messages[0].createdAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-emerald-900 dark:text-emerald-100">{messages[0].body}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70">
              From D&Z Smart Workshop · WhatsApp
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCheck className="h-3 w-3" /> {messages[0].status === "READ" ? t("rider.msg-read", lang) : t("rider.msg-delivered", lang)}
            </span>
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">{t("rider.notifications", lang)}</h2>
          <Link href="/rider/notifications" className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
            {t("common.view-all", lang)} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-xl border bg-card p-3 text-sm">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-muted-foreground">{t("rider.no-notifications", lang)}</p>}
        </div>
      </div>
      {messages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">{t("rider.messages", lang)}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> WhatsApp
            </span>
          </div>
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {m.direction === "IN" ? t("rider.you", lang) : "D&Z Smart Workshop"} · {m.channel}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">{m.createdAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short" })}</span>
                </div>
                <p className="mt-1 text-sm">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground pt-2">D&Z Rider</p>
    </div>
    </PageTransition>
  );
}