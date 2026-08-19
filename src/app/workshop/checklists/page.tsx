import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage() {
  const lang = await getLang();
  const templates = await db.checklistTemplate.findMany({ include: { items: { orderBy: { order: "asc" } } } });
  return (
    <div>
      <PageHeader title={t("nav.checklists", lang)} subtitle={t("ws.checklist.subtitle", lang)} />
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="rounded-2xl border bg-card p-5">
            <div className="font-semibold">{tmpl.name} {tmpl.isDefault && <Badge className="ml-1 bg-primary/10 text-primary">{t("ws.checklist.default", lang)}</Badge>}</div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {tmpl.items.map((i) => (
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
