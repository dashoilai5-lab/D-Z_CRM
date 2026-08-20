// Test rides module — scheduling + lifecycle (TEST-001..015).
import { db } from "@/lib/db";

export const testRidesModule = {
  async list(opts: { organisationId: string; status?: string; branchId?: string; search?: string }) {
    const where: Record<string, unknown> = { organisationId: opts.organisationId };
    if (opts.status) where.status = opts.status;
    if (opts.branchId) where.branchId = opts.branchId;
    if (opts.search) where.OR = [{ customer: { name: { contains: opts.search } } }, { lead: { customerName: { contains: opts.search } } }];
    const items = await db.testRide.findMany({
      where,
      orderBy: { rideDate: "desc" },
      take: 100,
      include: {
        branch: { select: { id: true, name: true, city: true } },
        lead: { select: { id: true, customerName: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
        salesperson: { select: { id: true, name: true } },
      },
    });
    return items;
  },

  async updateStatus(id: string, status: string, opts?: { userId?: string | null }) {
    const before = await db.testRide.findUnique({ where: { id } });
    if (!before) throw new Error("TEST_RIDE_NOT_FOUND");
    const updated = await db.testRide.update({ where: { id }, data: { status } });
    if (before.leadId) {
      // TEST-014: completion updates customer/lead timeline
      await db.leadActivity.create({
        data: { leadId: before.leadId, type: "TEST_RIDE", note: "Test ride " + status.toLowerCase().replace(/_/g, " "), userId: opts?.userId ?? null },
      });
      // TEST-015: completion triggers a sales follow-up task
      if (status === "COMPLETED") {
        const org = await db.organisation.findFirst();
        const lead = before.leadId ? await db.lead.findUnique({ where: { id: before.leadId }, select: { customerName: true } }) : null;
        if (org) {
          await db.task.create({
            data: {
              organisationId: org.id,
              branchId: before.branchId,
              ownerId: before.salespersonId,
              title: "Follow up after test ride: " + before.motorcycleModel,
              description: "Lead: " + (lead?.customerName ?? "—"),
              relatedType: "LEAD",
              relatedId: before.leadId,
              dueAt: new Date(Date.now() + 2 * 86400000),
              priority: "HIGH",
            },
          });
        }
      }
    }
    return updated;
  },

  async create(input: {
    organisationId: string; branchId: string; leadId?: string | null; customerId?: string | null;
    motorcycleModel: string; rideDate: Date; timeSlot?: string | null; salespersonId?: string | null; notes?: string | null;
  }) {
    const tr = await db.testRide.create({
      data: {
        organisationId: input.organisationId,
        branchId: input.branchId,
        leadId: input.leadId ?? null,
        customerId: input.customerId ?? null,
        motorcycleModel: input.motorcycleModel,
        rideDate: input.rideDate,
        timeSlot: input.timeSlot ?? null,
        salespersonId: input.salespersonId ?? null,
        notes: input.notes ?? null,
      },
    });
    if (input.leadId) {
      await db.leadActivity.create({ data: { leadId: input.leadId, type: "TEST_RIDE", note: "Test ride scheduled: " + input.motorcycleModel, userId: input.salespersonId ?? null } });
    }
    return tr;
  },
};
