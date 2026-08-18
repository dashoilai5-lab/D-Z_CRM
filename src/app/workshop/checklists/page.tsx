import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage() {
  const templates = await db.checklistTemplate.findMany({ include: { items: { orderBy: { order: "asc" } } } });
  return (
    <div>
      <PageHeader title="Checklists" subtitle="Inspection templates used by mechanics" />
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-card p-5">
            <div className="font-semibold">{t.name} {t.isDefault && <Badge className="ml-1 bg-primary/10 text-primary">default</Badge>}</div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {t.items.map((i) => (
                <div key={i.id} className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">{i.order}. {i.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Badge } from "@/components/ui/badge";
