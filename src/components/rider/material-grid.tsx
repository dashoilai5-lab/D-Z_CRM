"use client";

import { Megaphone, Clapperboard, BookOpen, type LucideIcon } from "lucide-react";
import { Lightbox, useLightbox } from "@/components/shared/lightbox";

export interface MaterialItem {
  id: string;
  title: string;
  type: string;
  month: string | null;
  url: string | null;
}

export interface MaterialGroup {
  type: string;
  label: string;
  grad: string;
  items: MaterialItem[];
}

const TYPE_ICON: Record<string, LucideIcon> = { POSTER: Megaphone, REEL: Clapperboard, STORY: BookOpen };

export function MaterialGrid({ groups }: { groups: MaterialGroup[] }) {
  const { openIndex, open, close } = useLightbox();
  // flatten all real images for lightbox navigation
  const flat: { src: string; alt: string; caption: string }[] = [];
  for (const g of groups) for (const it of g.items) if (it.url) flat.push({ src: it.url, alt: it.title, caption: it.title });
  // map item → flat index
  const indexOf = new Map<string, number>();
  flat.forEach((f, i) => indexOf.set(f.src, i));

  return (
    <>
      {groups.map((g) => {
        const Icon = TYPE_ICON[g.type] ?? Megaphone;
        return (
        <section key={g.type}>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">{g.label}</h2>
            <span className="text-xs text-muted-foreground">({g.items.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {g.items.map((a) => {
              const i = a.url ? indexOf.get(a.url) ?? 0 : -1;
              return (
                <div key={a.id} className="overflow-hidden rounded-2xl border bg-card">
                  {a.url ? (
                    <button type="button" onClick={() => open(i)} className="group relative block aspect-[3/4] w-full overflow-hidden bg-muted cursor-zoom-in" aria-label={"View " + a.title}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.url} alt={a.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                      <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    </button>
                  ) : (
                    <div className={"flex aspect-[3/4] items-center justify-center bg-gradient-to-br " + g.grad}>
                      <Icon className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="text-sm font-semibold truncate">{a.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{a.month ?? ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        );
      })}
      <Lightbox images={flat} index={openIndex} onClose={close} />
    </>
  );
}
