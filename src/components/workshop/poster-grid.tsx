"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, ZoomIn, Trash2, Pencil, X, Check, MessageCircle, Users } from "lucide-react";
import { sendPosterToCustomers, togglePosterPublished } from "@/actions/posters";
import { Lightbox, useLightbox, type LightboxImage } from "@/components/shared/lightbox";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export interface PosterItem {
  id: string;
  title: string;
  type: string;
  month: string | null;
  description: string | null;
  url: string | null;
  published: boolean;
}

export function PosterGrid({ posters, baseUrl = "http://localhost:3002" }: { posters: PosterItem[]; baseUrl?: string }) {
  const router = useRouter();
  const lang = useLang();
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
              <button type="button" onClick={() => open(i)} className="group relative block aspect-[3/4] w-full overflow-hidden bg-muted cursor-zoom-in" aria-label={t("carousel.view_poster", lang) + " " + p.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow">
                    <ZoomIn className="h-3.5 w-3.5" /> {t("ws.poster.view", lang)}
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
                <div><label className={labelCls}>{t("ws.poster.title", lang)}</label><input className={inputCls} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                <div><label className={labelCls}>{t("ws.poster.promo", lang)}</label><input className={inputCls} value={editForm.promo} onChange={(e) => setEditForm({ ...editForm, promo: e.target.value })} placeholder={t("ws.poster.promo-placeholder", lang)} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>{t("ws.poster.tone", lang)}</label>
                    <select className={inputCls} value={editForm.tone} onChange={(e) => setEditForm({ ...editForm, tone: e.target.value })}>
                      <option value="brand">{t("ws.mkt.tone.brand", lang)}</option><option value="deep">{t("ws.mkt.tone.deep", lang)}</option><option value="fresh">{t("ws.mkt.tone.fresh", lang)}</option><option value="bold">{t("ws.mkt.tone.bold", lang)}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{t("ws.poster.size", lang)}</label>
                    <select className={inputCls} value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}>
                      <option value="SQUARE">1:1</option><option value="STORY">9:16</option><option value="BANNER">16:9</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50" disabled={busy} onClick={() => saveEdit(p.id)}>
                    <Check className="h-3.5 w-3.5" /> {t("ws.poster.regenerate", lang)}
                  </button>
                  <button className="rounded-md border px-2 py-1.5 text-xs" onClick={() => setEditing(null)}><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{p.title}</div>
                  <button
                    type="button"
                    onClick={async () => { await togglePosterPublished(p.id, !p.published); router.refresh(); }}
                    className={"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors " + (p.published ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25" : "bg-muted text-muted-foreground hover:bg-muted/70")}
                    title={p.published ? t("ws.poster.shown-title", lang) : t("ws.poster.hidden-title", lang)}
                  >
                    <span className={"h-1.5 w-1.5 rounded-full " + (p.published ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                    {p.published ? t("ws.poster.on-news", lang) : t("ws.poster.off-news", lang)}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.type}{p.month ? " · " + p.month : ""}</div>
                {p.description && <p className="mt-2 text-xs text-muted-foreground">&quot;{p.description}&quot;</p>}
                <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
                  <a
                    href={"https://wa.me/?text=" + encodeURIComponent(tpl("ws.poster.whatsapp-text", lang, { title: p.title }) + (p.url ? " " + baseUrl + p.url : ""))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                    title={t("ws.poster.share-wa", lang)}
                  >
                    <MessageCircle className="h-3 w-3" /> {t("ws.poster.share", lang)}
                  </a>
                  <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-accent" onClick={() => startEdit(p)}>
                    <Pencil className="h-3 w-3" /> {t("ws.poster.edit", lang)}
                  </button>
                  <PosterBroadcast poster={p} />
                  {confirmDelete === p.id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">{t("ws.poster.delete-q", lang)}</span>
                      <button className="rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground" onClick={() => remove(p.id)}>{t("ws.poster.yes", lang)}</button>
                      <button className="rounded-md border px-2 py-1 text-[11px]" onClick={() => setConfirmDelete(null)}>{t("ws.poster.no", lang)}</button>
                    </span>
                  ) : (
                    <button className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(p.id)}>
                      <Trash2 className="h-3 w-3" /> {t("ws.poster.delete", lang)}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Lightbox key={openIndex} images={images} index={openIndex} onClose={close} />
    </>
  );
}

export function PosterBroadcast({ poster }: { poster: PosterItem }) {
  const router = useRouter();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string | null; tags: string | null }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setOpen(true);
    const res = await fetch("/api/poster-targets" + (tag ? "?tag=" + encodeURIComponent(tag) : ""));
    const data = await res.json();
    setCustomers(data.customers ?? []);
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  async function send() {
    setBusy(true); setMsg("");
    const r = await sendPosterToCustomers(poster.id, [...selected]);
    setBusy(false);
    setMsg(tpl("ws.poster.sent-msg", lang, { sent: r.sent, skipped: r.skipped }));
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-accent" onClick={load}>
        <Users className="h-3 w-3" /> {t("ws.poster.send-customers", lang)}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">{tpl("ws.poster.send-title", lang, { title: poster.title })}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input className="rounded-md border bg-background px-3 py-1.5 text-xs flex-1" placeholder={t("ws.poster.filter-tag", lang)} value={tag} onChange={(e) => { setTag(e.target.value); load(); }} />
              <button className="rounded-md border px-2 py-1.5 text-xs" onClick={() => { setSelected(new Set(customers.map((c) => c.id))); }}>{t("ws.poster.select-all", lang)}</button>
            </div>
            <div className="rounded-lg border max-h-56 overflow-y-auto divide-y">
              {customers.map((c) => (
                <label key={c.id} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-accent/40">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
                  <span className="flex-1 font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.phone ?? ""}</span>
                  {c.tags && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px]">{c.tags}</span>}
                </label>
              ))}
              {customers.length === 0 && <p className="px-3 py-6 text-center text-xs text-muted-foreground">{t("ws.poster.no-match", lang)}</p>}
            </div>
            {msg && <p className="mt-2 text-xs text-primary">{msg}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-md border px-3 py-1.5 text-xs" onClick={() => setOpen(false)}>{t("common.cancel", lang)}</button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50" disabled={busy || selected.size === 0} onClick={send}>
                {busy ? t("ws.poster.sending", lang) : tpl("ws.poster.send-n", lang, { n: selected.size })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
