import { db } from "@/lib/db";
import { TemplateManager } from "@/components/workshop/template-manager";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const org = await db.organisation.findFirst();
  const templates = await db.messageTemplate.findMany({ where: { organisationId: org!.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Message Templates</h1>
        <p className="text-sm text-muted-foreground">Placeholders: {"{name}"} {"{service}"} {"{bike}"} {"{branch}"} {"{date}"} {"{time}"} {"{ref}"} {"{link}"} {"{invoice}"} {"{total}"}</p>
      </div>
      <TemplateManager />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2.5 font-medium">Name</th><th className="px-3 py-2.5 font-medium">Channel</th><th className="px-3 py-2.5 font-medium">Body</th><th className="px-3 py-2.5 font-medium">Active</th></tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2.5 font-medium">{t.name}</td>
                <td className="px-3 py-2.5 text-xs">{t.channel}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-md truncate">{t.body}</td>
                <td className="px-3 py-2.5 text-xs">{t.active ? "✓" : "—"}</td>
              </tr>
            ))}
            {templates.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">No templates yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
