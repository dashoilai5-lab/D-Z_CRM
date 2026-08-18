import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { aiService } from "@/modules/ai/service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AiCentrePage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const recs = await aiService.recommendations(branch?.id);
  return (
    <div>
      <PageHeader title="AI Command Centre" subtitle="Rule-based in the prototype — OpenAI replaces content/summary generation later (§39)" />
      <div className="space-y-3">
        {recs.map((r, i) => (
          <Link key={i} href={r.href} className="group flex items-start gap-4 rounded-2xl border bg-card p-5 hover:border-primary/40 transition-colors">
            <div className={"h-10 w-10 shrink-0 rounded-xl flex items-center justify-center " + (r.tone === "danger" ? "bg-red-50 text-red-600" : r.tone === "warn" ? "bg-amber-50 text-amber-600" : "bg-primary/10 text-primary")}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{r.detail}</p>
              <span className="mt-2 inline-block text-xs font-bold text-primary group-hover:underline">{r.action} →</span>
            </div>
          </Link>
        ))}
        {recs.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">No recommendations — everything is on track. ✅</div>
        )}
      </div>
    </div>
  );
}
