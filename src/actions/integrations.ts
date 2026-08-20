"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth/audit";

export async function toggleIntegration(id: string, enabled: boolean) {
  const cfg = await db.integrationConfig.update({ where: { id }, data: { enabled } });
  await audit({ organisationId: cfg.organisationId, action: "INTEGRATION_" + (enabled ? "ENABLED" : "DISABLED"), entity: "INTEGRATION_CONFIG", entityId: id, after: { provider: cfg.provider, enabled } });
  revalidatePath("/", "layout");
  return { ok: true };
}
