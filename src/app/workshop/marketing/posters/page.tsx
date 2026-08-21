import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { PosterForm } from "@/components/workshop/marketing-forms";
import { PosterGrid } from "@/components/workshop/poster-grid";
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
      <PosterGrid
        posters={assets.map((a) => ({ id: a.id, title: a.title, type: a.type, month: a.month, description: a.description, url: a.url, published: a.published }))}
        baseUrl={process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3002"}
      />
      {assets.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("ws.mkt.posters.empty", lang)}</p>}
    </div>
  );
}
