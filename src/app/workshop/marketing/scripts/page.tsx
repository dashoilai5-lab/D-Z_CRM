import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { ScriptForm } from "@/components/workshop/marketing-forms";
import { ScriptCopy } from "@/components/workshop/script-copy";
import { Clapperboard } from "lucide-react";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const lang = await getLang();
  const { scripts } = await marketingService.overview();
  return (
    <div>
      <PageHeader
        title={t("ws.mkt.scripts.title", lang)}
        subtitle={[
          t("ws.mkt.scripts.count", lang).replace("{n}", String(scripts.length)),
          t("ws.mkt.scripts.templates", lang),
        ].join(" · ")}
        action={<ScriptForm />}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {scripts.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-card p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Clapperboard className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground">{s.platform}{s.tone ? " · " + s.tone : ""}</div>
                </div>
              </div>
              <ScriptCopy title={s.title} hook={s.hook} body={s.body} />
            </div>
            {s.hook && <p className="mt-3 text-sm font-medium text-primary">“{s.hook}”</p>}
            <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap flex-1">{s.body}</p>
          </div>
        ))}
        {scripts.length === 0 && <p className="text-sm text-muted-foreground text-center py-10 col-span-full">{t("ws.mkt.scripts.empty", lang)}</p>}
      </div>
    </div>
  );
}
