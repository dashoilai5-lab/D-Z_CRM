import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { PosterForm } from "@/components/workshop/marketing-forms";
import { Image } from "lucide-react";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PostersPage() {
  const lang = await getLang();
  const { assets } = await marketingService.overview();
  return (
    <div>
      <PageHeader
        title={t("ws.mkt.posters.title", lang)}
        subtitle={[
          t("ws.mkt.posters.packs", lang).replace("{n}", String(assets.length)),
          t("ws.mkt.posters.generated", lang),
        ].join(" · ")}
        action={<PosterForm />}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card overflow-hidden">
            {a.url ? (
              <div className="aspect-[3/4] bg-muted overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/15 via-muted to-muted flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground/60" />
              </div>
            )}
            <div className="p-4">
              <div className="font-medium text-sm">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.type}{a.month ? " · " + a.month : ""}</div>
              {a.description && <p className="mt-2 text-xs text-muted-foreground">“{a.description}”</p>}
            </div>
          </div>
        ))}
        {assets.length === 0 && <p className="text-sm text-muted-foreground text-center py-10 col-span-full">{t("ws.mkt.posters.empty", lang)}</p>}
      </div>
    </div>
  );
}
