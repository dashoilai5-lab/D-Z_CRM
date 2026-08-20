import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReminderRowActions } from "@/components/workshop/reminder-actions";
import { crmService } from "@/modules/crm/service";
import { fmtDate, fmtKM } from "@/lib/format";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const reminders = await crmService.reminders();
  const lang = await getLang();
  const order = { OVERDUE: 0, DUE: 1, DUE_SOON: 2, UPCOMING: 3, BOOKED: 4 } as const;
  const sorted = [...reminders].sort((a, b) => (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9));

  return (
    <div>
      <PageHeader title={t("ws.crm.reminders.title", lang)} subtitle={t("ws.crm.reminders.subtitle", lang)} />
      <div className="dz-panel overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="dz-table">
            <thead>
              <tr>
                <th className="px-4 py-3 font-medium">{t("ws.crm.reminders.col.customer", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.crm.reminders.col.motorcycle", lang)}</th>
                <th className="px-4 py-3 font-medium">{t("ws.crm.reminders.col.last-service", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.crm.reminders.col.next-service", lang)}</th>
                <th className="px-4 py-3 font-medium">{t("ws.crm.reminders.col.gap", lang)}</th><th className="px-4 py-3 font-medium">{t("common.status", lang)}</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.customer.name}<div className="text-xs text-muted-foreground">{r.customer.phone}</div></td>
                  <td className="px-4 py-3 text-xs">{r.motorcycle.brand} {r.motorcycle.model}<div className="text-muted-foreground">{r.motorcycle.plate}</div></td>
                  <td className="px-4 py-3 text-xs tabular-nums">{fmtKM(r.lastServiceMileage)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{fmtKM(r.nextServiceMileage)}{r.estimatedDate ? <div className="text-xs font-normal text-muted-foreground">{t("ws.crm.reminders.est", lang)} {fmtDate(r.estimatedDate)}</div> : null}</td>
                  <td className="px-4 py-3 tabular-nums text-xs">{r.kmGap > 0 ? "+" + r.kmGap.toLocaleString() : r.kmGap.toLocaleString()} km</td>
                  <td className="px-4 py-3"><StatusBadge kind="reminder" value={r.status} /></td>
                  <td className="px-4 py-3"><ReminderRowActions reminderId={r.id} customerId={r.customer.id} motorcycleId={r.motorcycle.id} nextServiceMileage={r.nextServiceMileage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
