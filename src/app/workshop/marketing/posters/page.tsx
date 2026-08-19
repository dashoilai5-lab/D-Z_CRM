import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { PosterForm } from "@/components/workshop/marketing-forms";
import { Image } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PostersPage() {
  const { assets } = await marketingService.overview();
  return (
    <div>
      <PageHeader title="Poster Library" subtitle={assets.length + " poster packs · generated with mocked AI content"} action={<PosterForm />} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card overflow-hidden">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/15 via-muted to-muted flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div className="p-4">
              <div className="font-medium text-sm">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.type}{a.month ? " · " + a.month : ""}</div>
              {a.description && <p className="mt-2 text-xs text-muted-foreground">“{a.description}”</p>}
            </div>
          </div>
        ))}
        {assets.length === 0 && <p className="text-sm text-muted-foreground text-center py-10 col-span-full">No posters yet — add the first one.</p>}
      </div>
    </div>
  );
}
