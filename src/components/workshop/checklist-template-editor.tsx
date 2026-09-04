"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import {
  createChecklistTemplate, updateChecklistTemplate, deleteChecklistTemplate, setDefaultChecklistTemplate,
  addChecklistItem, updateChecklistItem, deleteChecklistItem, reorderChecklistItems,
} from "@/actions/checklists";

type ItemDto = { id: string; name: string; category: string | null; order: number };
type TemplateDto = { id: string; name: string; isDefault: boolean; items: ItemDto[] };

export function ChecklistTemplateEditor({ templates, canEdit }: { templates: TemplateDto[]; canEdit: boolean }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, { name?: string; category?: string }>>({});

  const val = (id: string, field: "name" | "category") => drafts[id]?.[field];
  const setDraft = (id: string, field: "name" | "category", v: string) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: v } }));
  const clearDraft = (id: string) => setDrafts((d) => { const rest = { ...d }; delete rest[id]; return rest; });

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  const saveTemplateName = (tmpl: TemplateDto) => {
    const v = val(tmpl.id, "name");
    if (v == null || v === tmpl.name) { clearDraft(tmpl.id); return; }
    run(async () => { await updateChecklistTemplate(tmpl.id, { name: v }); clearDraft(tmpl.id); });
  };

  const saveItem = (it: ItemDto) => {
    const v = val(it.id, "name");
    const c = val(it.id, "category");
    if ((v == null || v === it.name) && (c == null || c === (it.category ?? ""))) { clearDraft(it.id); return; }
    run(async () => { await updateChecklistItem(it.id, { name: v ?? it.name, category: c ?? it.category ?? "" }); clearDraft(it.id); });
  };

  const move = (tmpl: TemplateDto, idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= tmpl.items.length) return;
    const ids = tmpl.items.map((i) => i.id);
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    run(async () => { await reorderChecklistItems(tmpl.id, ids); });
  };

  const delItem = (id: string) => {
    if (!window.confirm(t("ws.checklist.confirm-delete", lang))) return;
    run(async () => { await deleteChecklistItem(id); });
  };

  const delTemplate = (tmpl: TemplateDto) => {
    if (!window.confirm(t("ws.checklist.confirm-delete", lang))) return;
    run(async () => { const r = await deleteChecklistTemplate(tmpl.id); if (!r.ok) toast.error(t("ws.checklist.last-template", lang)); });
  };

  const addItem = (tmpl: TemplateDto) => run(async () => { await addChecklistItem(tmpl.id, { name: t("ws.checklist.new-item", lang) }); });
  const addTemplate = () => run(async () => { await createChecklistTemplate({ name: t("ws.checklist.new-template", lang) }); });
  const setDefault = (tmpl: TemplateDto) => run(async () => { await setDefaultChecklistTemplate(tmpl.id); });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && <Button size="sm" variant="outline" onClick={addTemplate} disabled={pending}><Plus className="h-4 w-4 mr-1" />{t("ws.checklist.add-template", lang)}</Button>}
      </div>
      {templates.length === 0 && <p className="text-sm text-muted-foreground">{t("ws.checklist.empty", lang)}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="dz-panel p-5 space-y-3">
            <div className="flex items-center gap-2">
              {canEdit
                ? <Input value={val(tmpl.id, "name") ?? tmpl.name} onChange={(e) => setDraft(tmpl.id, "name", e.target.value)} onBlur={() => saveTemplateName(tmpl)} className="font-semibold" />
                : <div className="font-semibold">{tmpl.name}</div>}
              {tmpl.isDefault && <span className="ml-1 text-[10px] font-semibold rounded-full bg-primary/10 text-primary px-2 py-0.5 shrink-0">{t("ws.checklist.default", lang)}</span>}
              {canEdit && (
                <div className="flex gap-1 ml-auto">
                  {!tmpl.isDefault && <Button size="icon" variant="ghost" className="h-7 w-7" title={t("ws.checklist.set-default", lang)} onClick={() => setDefault(tmpl)}><Star className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title={t("ws.checklist.delete-template", lang)} onClick={() => delTemplate(tmpl)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              )}
            </div>

            {canEdit ? (
              <div className="space-y-1.5">
                {tmpl.items.map((it, idx) => (
                  <div key={it.id} className="flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5">
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{idx + 1}</span>
                    <Input value={val(it.id, "name") ?? it.name} onChange={(e) => setDraft(it.id, "name", e.target.value)} onBlur={() => saveItem(it)} placeholder={t("ws.checklist.item-name", lang)} className="h-8 text-sm" />
                    <Input value={val(it.id, "category") ?? it.category ?? ""} onChange={(e) => setDraft(it.id, "category", e.target.value)} onBlur={() => saveItem(it)} placeholder={t("ws.checklist.item-category", lang)} className="h-8 w-24 text-sm" />
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" disabled={idx === 0} onClick={() => move(tmpl, idx, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" disabled={idx === tmpl.items.length - 1} onClick={() => move(tmpl, idx, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive" onClick={() => delItem(it.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" onClick={() => addItem(tmpl)} disabled={pending}><Plus className="h-4 w-4 mr-1" />{t("ws.checklist.add-item", lang)}</Button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {tmpl.items.map((it) => (
                  <div key={it.id} className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">{it.order}. {it.name}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
