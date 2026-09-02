"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Image lightbox: click a thumbnail to enlarge full-screen, X / backdrop / Esc to close.
 * Supports prev/next navigation when multiple images are passed.
 */
export function useLightbox() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const open = (i: number) => setOpenIndex(i);
  const close = () => setOpenIndex(null);

  // Esc to close
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  return { openIndex, open, close };
}

export function Lightbox({ images, index, onClose }: { images: LightboxImage[]; index: number | null; onClose: () => void }) {
  const lang = useLang();
  // index changes remount via key={index} at call sites, so initial state is enough.
  const [cur, setCur] = useState(index ?? 0);

  useEffect(() => {
    if (index === null) return;
    // Esc handled by hook; lock scroll while open
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [index]);

  if (index === null || images.length === 0) return null;
  const img = images[Math.min(cur, images.length - 1)];
  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("common.image-preview", lang)}
    >
      {/* close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label={t("common.close-image", lang)}
        data-testid="lightbox-close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* image */}
      <div className="max-h-[85vh] max-w-[92vw] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={img.alt} className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
        {img.caption && <p className="mt-3 text-sm text-white/80">{img.caption}</p>}
      </div>

      {/* prev/next when multiple */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={t("common.previous-image", lang)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={t("common.next-image", lang)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 text-xs text-white/70">{cur + 1} / {images.length}</div>
        </>
      )}
    </div>
  );
}
