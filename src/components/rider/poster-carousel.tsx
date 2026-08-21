"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox, useLightbox, type LightboxImage } from "@/components/shared/lightbox";

/** Auto-sliding poster carousel (rider News): fades/slides between posters every
 *  4s, pauses on hover, swipeable on touch, dots + arrows for manual control,
 *  tap opens the lightbox. Each slide keeps the poster's own aspect ratio —
 *  parsed from the AI-gen size meta (SQUARE 1:1 / STORY 9:16 / BANNER 16:9) or,
 *  for photos without meta, measured from the loaded image. */
export function PosterCarousel({ posters }: { posters: { id: string; title: string; url: string | null; description?: string | null }[] }) {
  const { openIndex, open, close } = useLightbox();
  const n = posters.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ratios, setRatios] = useState<Record<string, string>>({});
  const touchX = useRef<number | null>(null);
  const images: LightboxImage[] = posters.filter((p) => p.url).map((p) => ({ src: p.url!, alt: p.title, caption: p.title }));

  /** Aspect from size meta; falls back to a 3:4 poster default. */
  const metaRatio = (p: { description?: string | null }): string =>
    p.description?.includes("STORY") ? "9 / 16" : p.description?.includes("BANNER") ? "16 / 9" : p.description?.includes("SQUARE") ? "1 / 1" : "3 / 4";

  const next = useCallback(() => setIdx((i) => (i + 1) % n), [n]);
  const prev = () => setIdx((i) => (i - 1 + n) % n);

  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, n, next]);

  if (n === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
        touchX.current = null;
      }}
    >
      {/* sliding track */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: "translateX(-" + idx * 100 + "%)" }}
      >
        {posters.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(posters.findIndex((x) => x.id === p.id))}
            className="relative w-full shrink-0 cursor-pointer overflow-hidden"
            style={{ aspectRatio: ratios[p.id] ?? metaRatio(p) }}
            aria-label={"View poster: " + p.title}
          >
            {p.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.url}
                alt={p.title}
                className="h-full w-full object-cover"
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth > 0) {
                    setRatios((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: el.naturalWidth / el.naturalHeight + "" }));
                  }
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/50"><Megaphone className="h-8 w-8" /></div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2 pt-8 text-left text-sm font-medium text-white">{p.title}</span>
          </button>
        ))}
      </div>

      {/* arrows (pointer devices) */}
      {n > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/55"
            aria-label="Previous poster"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/55"
            aria-label="Next poster"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* dots */}
      {n > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {posters.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80")}
              aria-label={"Go to poster " + (i + 1)}
            />
          ))}
        </div>
      )}

      <Lightbox key={openIndex} images={images} index={openIndex} onClose={close} />
    </div>
  );
}
