import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { StaffManager } from "@/components/workshop/staff-manager";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await db.user.findMany({
    select: { id: true, name: true, role: true, phone: true, email: true, active: true, createdAt: true, _count: { select: { jobs: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <div>
      <PageHeader title="Staff" subtitle={staff.length + " team members · add mechanics and counter staff here"} />
      <StaffManager staff={staff.map((s) => ({ id: s.id, name: s.name, role: s.role, phone: s.phone, email: s.email, active: s.active, jobCount: s._count.jobs }))} />
    </div>
  );
}
