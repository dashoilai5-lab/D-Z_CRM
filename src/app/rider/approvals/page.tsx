import { getRiderCustomer } from "@/lib/rider-customer";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { inspectionService } from "@/modules/inspections/service";
import { ApprovalCard } from "@/components/rider/approval-card";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const lang = await getLang();
  const customer = await getRiderCustomer();
  if (!customer) return null;
  const approvals = await inspectionService.listForCustomer(customer.id);
  const pending = approvals.filter((a) => a.status === "PENDING");
  const past = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("approvals.title", lang)}</h1>
      {pending.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">{t("approvals.sub", lang)}</p>
          <div className="space-y-4">
            {pending.map((a) => <ApprovalCard key={a.id} approval={a} />)}
          </div>
        </>
      )}
      {pending.length === 0 && (
        <div className="dz-panel p-8 text-center text-sm text-muted-foreground">
          {t("approvals.empty", lang)}
        </div>
      )}
      {past.length > 0 && (
        <>
          <h2 className="font-semibold pt-3">{t("approvals.history", lang)}</h2>
          <div className="space-y-2">{past.map((a) => <ApprovalCard key={a.id} approval={a} />)}</div>
        </>
      )}
    </div>
  );
}
