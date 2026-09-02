import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, Mail, CalendarClock, User, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { leadsModule } from "@/modules/leads/service";
import { formatRM } from "@/lib/money";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { LeadActions } from "@/components/workshop/lead-actions";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const lang = await getLang();
  const { id } = await params;
  const org = await db.organisation.findFirst();
  const lead = await leadsModule.get(id);
  if (!lead) notFound();
  const [stages, salespeople] = await Promise.all([
    db.leadStage.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { order: "asc" } }),
    db.user.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);

  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/workshop/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> {t("lead.page-title", lang)}
      </Link>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{lead.customerName}</h1>
            <p className="text-sm text-muted-foreground">{lead.leadNumber} · {lead.source?.name ?? t("lead.unknown-source", lang)} · created {fmtDate(lead.createdAt)}</p>
          </div>
          <span className={"rounded-full px-3 py-1 text-xs font-medium " + (lead.status === "WON" ? "bg-emerald-500/15 text-emerald-600" : lead.status === "LOST" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
            {lead.status === "OPEN" ? t("lead.status.OPEN", lang) : lead.status === "WON" ? t("lead.closed-won", lang) : t("lead.closed-lost", lang)}
          </span>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          {lead.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{lead.phone}</div>}
          {lead.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{lead.email}</div>}
          {lead.motorcycleInterest && <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />{lead.motorcycleInterest}</div>}
          {lead.estimatedValueSen != null && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t("lead.est-value-label", lang)}</span>{formatRM(lead.estimatedValueSen)}</div>}
          {lead.nextFollowUpAt && <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-muted-foreground" />{t("lead.next-followup-label", lang)} {fmtDateTime(lead.nextFollowUpAt)}</div>}
          {lead.assignedUser && <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{lead.assignedUser.name}</div>}
        </div>
        {lead.notes && <p className="mt-3 text-sm text-muted-foreground border-t pt-3">{lead.notes}</p>}
        {lead.convertedCustomer && (
          <p className="mt-3 text-sm">
            {t("lead.converted", lang)} <Link className="text-primary hover:underline" href={"/workshop/customers/" + lead.convertedCustomer.id}>{lead.convertedCustomer.name}</Link>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">{t("lead.update", lang)}</h2>
          <LeadActions leadId={lead.id} stages={stages} salespeople={salespeople} currentStageId={lead.stageId} currentOwnerId={lead.assignedUserId} />
        </div>
        <div className="dz-panel p-5">
          <h2 className="font-semibold mb-3">{t("lead.timeline", lang)}</h2>
          {lead.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("lead.no-activity", lang)}</p>
          ) : (
            <ol className="relative ml-2 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {lead.activities.map((a) => (
                <li key={a.id} className="relative flex gap-3 pl-5 text-sm">
                  <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-primary/30 bg-background" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.type.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{fmtDateTime(a.createdAt)}</span>
                    </div>
                    {a.note && <div className="mt-0.5 text-muted-foreground text-xs">{a.note}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
