import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { getSessionUser } from "@/lib/session-user";
import { t } from "@/lib/i18n";
import { ChecklistTemplateEditor } from "@/components/workshop/checklist-template-editor";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage() {
  const [lang, session] = await Promise.all([getLang(), getSessionUser()]);
  const templates = await db.checklistTemplate.findMany({
    include: { items: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" },
  });
  const dto = templates.map((tmpl) => ({
    id: tmpl.id,
    name: tmpl.name,
    isDefault: tmpl.isDefault,
    items: tmpl.items.map((i) => ({ id: i.id, name: i.name, category: i.category, order: i.order })),
  }));
  // Mechanics run checklists; management staff edit the library.
  const canEdit = session.kind === "staff" && session.role !== "MECHANIC";
  return (
    <div>
      <PageHeader title={t("nav.checklists", lang)} subtitle={t("ws.checklist.subtitle", lang)} />
      <ChecklistTemplateEditor templates={dto} canEdit={canEdit} />
    </div>
  );
}
