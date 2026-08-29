"use client";

import { Lightbox, useLightbox, type LightboxImage } from "@/components/shared/lightbox";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

const ORDER = ["FRONT", "BACK", "LEFT", "RIGHT", "METER"] as const;
type Angle = (typeof ORDER)[number];
const ANGLE_KEY: Record<Angle, string> = { FRONT: "mech.sop.front", BACK: "mech.sop.back", LEFT: "mech.sop.left", RIGHT: "mech.sop.right", METER: "mech.sop.meter" };

export interface JobPhotoView { angle: string; photoUrl: string }

/** Workshop counter: pre-service SOP photos — click a thumbnail to enlarge (X / backdrop / Esc to close). */
export function JobPhotosView({ photos }: { photos: JobPhotoView[] }) {
  const lang = useLang();
  const { openIndex, open, close } = useLightbox();

  const slots = ORDER.map((a) => ({ angle: a, photo: photos.find((p) => p.angle === a) ?? null }));
  const present = slots.filter((s) => s.photo);
  const images: LightboxImage[] = present.map((s) => ({
    src: s.photo!.photoUrl,
    alt: t(ANGLE_KEY[s.angle], lang),
    caption: t(ANGLE_KEY[s.angle], lang),
  }));
  const indexFor = (a: Angle) => present.findIndex((s) => s.angle === a);

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {slots.map((s) => (
          <button
            key={s.angle}
            type="button"
            disabled={!s.photo}
            onClick={() => s.photo && open(indexFor(s.angle))}
            className="relative aspect-square overflow-hidden rounded-xl border bg-muted/40 disabled:cursor-default"
          >
            {s.photo ? (
              <img src={s.photo.photoUrl} alt={s.angle} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/60">—</span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-medium text-white">{t(ANGLE_KEY[s.angle], lang)}</span>
          </button>
        ))}
      </div>
      <Lightbox key={openIndex ?? "closed"} images={images} index={openIndex} onClose={close} />
    </>
  );
}
