import "server-only";
import { db } from "@/lib/db";

export async function audit(opts: {
  organisationId: string;
  branchId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        organisationId: opts.organisationId,
        branchId: opts.branchId ?? null,
        userId: opts.userId ?? null,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId ?? null,
        before: opts.before != null ? JSON.stringify(opts.before) : null,
        after: opts.after != null ? JSON.stringify(opts.after) : null,
        ip: opts.ip ?? null,
      },
    });
  } catch {
    // audit must never break the main operation
  }
}
