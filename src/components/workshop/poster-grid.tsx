"use client";

import { useState } from "react";
import { Image as ImageIcon, ZoomIn } from "lucide-react";
import { Lightbox, useLightbox, type LightboxImage } from "@/components/shared/lightbox";

export interface PosterItem {
  id: string;
  title: string;
  type: string;
  month: string | null;
  description: string | null;
  url: string | null;
}

export function PosterGrid({ posters }: { posters: PosterItem[] }) {
  const { openIndex, open, close } = useLightbox();
  const images: LightboxImage[] = posters
    .filter((p) => p.url)
    .map((p) => ({ src: p.url!, alt: p.title, caption: p.title }));

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posters.map((p, i) => (
          <div key={p.id} className="rounded-2xl border bg-card overflow-hidden flex flex-col">
            {p.url ? (
              <button
                type="button"
                onClick={() => open(i)}
                className="group relative block aspect-[3/4] w-full overflow-hidden bg-muted cursor-zoom-in"
                aria-label={"View poster: " + p.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow">
                    <ZoomIn className="h-3.5 w-3.5" /> View
                  </span>
                </span>
              </button>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
              </div>
            )}
            <div className="p-4 flex-1">
              <div className="font-medium text-sm">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.type}{p.month ? " · " + p.month : ""}</div>
              {p.description && <p className="mt-2 text-xs text-muted-foreground">“{p.description}”</p>}
            </div>
          </div>
        ))}
      </div>
      <Lightbox images={images} index={openIndex} onClose={close} />
    </>
  );
}
