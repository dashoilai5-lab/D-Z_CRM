import { db } from "@/lib/db";
import { runSeed } from "@/lib/seed-runner";

/** Wipe all demo data and reseed (ui RESET DEMO DATA + pnpm db:reset). */
export async function resetDemoData(): Promise<{ ok: boolean; counts: Record<string, number> }> {
  const tables = [
    "payment", "invoiceItem", "invoice", "purchaseOrderItem", "purchaseOrder",
    "stockMovement", "inventory", "serviceJobPart", "serviceJobItem", "customerApproval",
    "inspectionFinding", "checklistExecutionItem", "checklistExecution", "review",
    "message", "notification", "serviceReminder", "booking", "serviceJob",
    "marketingAsset", "contentScript", "campaign", "purchaseOrderItem",
    "servicePackageItem", "servicePackage", "checklistItem", "checklistTemplate",
    "product", "supplier", "motorcycle", "customerAuthProfile", "customer", "user", "branch", "organisation",
  ];
  for (const t of [...new Set(tables)]) {
    await (db as unknown as Record<string, { deleteMany(args?: unknown): Promise<unknown> }>)[t]?.deleteMany({});
  }
  const counts = await runSeed();
  return { ok: true, counts };
}
