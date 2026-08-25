import { getRiderCustomer } from "@/lib/rider-customer";
import { inspectionService } from "@/modules/inspections/service";
import { ApprovalCard } from "@/components/rider/approval-card";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const customer = await getRiderCustomer();
  if (!customer) return null;
  const approvals = await inspectionService.listForCustomer(customer.id);
  const pending = approvals.filter((a) => a.status === "PENDING");
  const past = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Approvals</h1>
      {pending.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">The workshop found additional work that needs your go-ahead.</p>
          <div className="space-y-4">
            {pending.map((a) => <ApprovalCard key={a.id} approval={a} />)}
          </div>
        </>
      )}
      {pending.length === 0 && (
        <div className="dz-panel p-8 text-center text-sm text-muted-foreground">
          No pending approvals — all clear.
        </div>
      )}
      {past.length > 0 && (
        <>
          <h2 className="font-semibold pt-3">History</h2>
          <div className="space-y-2">{past.map((a) => <ApprovalCard key={a.id} approval={a} />)}</div>
        </>
      )}
    </div>
  );
}