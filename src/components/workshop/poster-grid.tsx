"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, ZoomIn, Trash2, Pencil, X, Check, MessageCircle } from "lucide-react";
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
  const router = useRouter();
  const { openIndex, open, close } = useLightbox();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", subtitle: "", promo: "", tone: "brand", size: "SQUARE" });
  const [busy, setBusy] = useState(false);
  const images: LightboxImage[] = posters.filter((p) => p.url).map((p) => ({ src: p.url!, alt: p.title, caption: p.title }));

  function parseMeta(p: PosterItem) {
    const m = p.description?.match(/AI-generated · (\w+) · (\w+)/);
    return { size: m?.[1] ?? "SQUARE", tone: m?.[2] ?? "brand" };
  }

  async function remove(id: string) {
    await fetch("/api/poster/" + id, { method: "DELETE" });
    setConfirmDelete(null);
    router.refresh();
  }

  function startEdit(p: PosterItem) {
    const meta = parseMeta(p);
    setEditForm({ title: p.title, subtitle: "", promo: "", tone: meta.tone, size: meta.size });
    setEditing(p.id);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    const res = await fetch("/api/poster/" + id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setBusy(false);
    if (res.ok) { setEditing(null); router.refresh(); }
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm w-full";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posters.map((p, i) => (
          <div key={p.id} className="rounded-2xl border bg-card overflow-hidden flex flex-col">
            {p.url ? (
              <button type="button" onClick={() => open(i)} className="group relative block aspect-[3/4] w-full overflow-hidden bg-muted cursor-zoom-in" aria-label={"View poster: " + p.title}>
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
            {editing === p.id ? (
              <div className="p-4 space-y-2 flex-1">
                <div><label className={labelCls}>Title</label><input className={inputCls} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                <div><label className={labelCls}>Promo</label><input className={inputCls} value={editForm.promo} onChange={(e) => setEditForm({ ...editForm, promo: e.target.value })} placeholder="e.g. RM20 OFF" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Tone</label>
                    <select className={inputCls} value={editForm.tone} onChange={(e) => setEditForm({ ...editForm, tone: e.target.value })}>
                      <option value="brand">Brand</option><option value="deep">Deep Blue</option><option value="fresh">Fresh</option><option value="bold">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Size</label>
                    <select className={inputCls} value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}>
                      <option value="SQUARE">1:1</option><option value="STORY">9:16</option><option value="BANNER">16:9</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50" disabled={busy} onClick={() => saveEdit(p.id)}>
                    <Check className="h-3.5 w-3.5" /> Regenerate
                  </button>
                  <button className="rounded-md border px-2 py-1.5 text-xs" onClick={() => setEditing(null)}><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex-1">
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.type}{p.month ? " · " + p.month : ""}</div>
                {p.description && <p className="mt-2 text-xs text-muted-foreground">"{p.description}"</p>}
                <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
                  <a
                    href={"https://wa.me/?text=" + encodeURIComponent("Check out our new poster: " + p.title + (p.url ? " " + "http://localhost:3002" + p.url : ""))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                    title="Share to WhatsApp"
                  >
                    <MessageCircle className="h-3 w-3" /> Share
                  </a>
                  <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-accent" onClick={() => startEdit(p)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  {confirmDelete === p.id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Delete?</span>
                      <button className="rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground" onClick={() => remove(p.id)}>Yes</button>
                      <button className="rounded-md border px-2 py-1 text-[11px]" onClick={() => setConfirmDelete(null)}>No</button>
                    </span>
                  ) : (
                    <button className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(p.id)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Lightbox images={images} index={openIndex} onClose={close} />
    </>
  );
}
