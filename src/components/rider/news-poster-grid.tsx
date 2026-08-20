"use client";

import { Megaphone } from "lucide-react";
import { Lightbox, useLightbox, type LightboxImage } from "@/components/shared/lightbox";

export function NewsPosterGrid({ posters }: { posters: { id: string; title: string; url: string | null }[] }) {
  const { openIndex, open, close } = useLightbox();
  const images: LightboxImage[] = posters.filter((p) => p.url).map((p) => ({ src: p.url!, alt: p.title, caption: p.title }));
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {posters.map((p, i) => (
        <button key={p.id} type="button" onClick={() => open(i)} className="group relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted" aria-label={"View poster: " + p.title}>
          {p.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/50"><Megaphone className="h-6 w-6" /></div>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-6 text-left text-[11px] font-medium text-white">{p.title}</span>
        </button>
      ))}
      <Lightbox images={images} index={openIndex} onClose={close} />
    </div>
  );
}
