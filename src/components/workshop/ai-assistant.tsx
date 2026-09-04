"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Minus } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { askAssistantAction } from "@/actions/assistant";

type Msg = { role: "user" | "assistant"; content: string };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function WorkshopAIAssistant({ userId }: { userId?: string }) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ w: 380, h: 560 });
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: t("ai.assistant.welcome", lang) }]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const sizeRef = useRef(size);
  const openRef = useRef(open);
  useEffect(() => { sizeRef.current = size; openRef.current = open; });

  const KEY = "dz.workshop-ai" + (userId ? "." + userId : "");

  const persist = (o: boolean, s: { w: number; h: number }) => {
    try { localStorage.setItem(KEY, JSON.stringify({ open: o, size: s })); } catch { /* ignore */ }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      const id = requestAnimationFrame(() => {
        if (s?.open) setOpen(true);
        if (s?.size?.w) setSize(s.size);
      });
      return () => cancelAnimationFrame(id);
    } catch { /* ignore */ }
  }, [KEY]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, w: sizeRef.current.w, h: sizeRef.current.h };
    const move = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.x;
      const dy = ev.clientY - dragRef.current.y;
      setSize({ w: clamp(dragRef.current.w + dx, 280, 640), h: clamp(dragRef.current.h - dy, 320, 760) });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      persist(openRef.current, sizeRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    const userMsg: Msg = { role: "user", content: question };
    const next: Msg[] = [...messages, userMsg];
    setMessages(next); setText(""); setLoading(true); setError("");
    try {
      const res = await askAssistantAction({ messages: next.map((m) => ({ role: m.role, content: m.content })) });
      if (res.ok && res.reply) setMessages([...next, { role: "assistant", content: res.reply }]);
      else setError(res.error ?? "Failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };

  const toggle = (o: boolean) => { setOpen(o); persist(o, sizeRef.current); };
  const clear = () => { setMessages([{ role: "assistant", content: t("ai.assistant.welcome", lang) }]); setError(""); };

  const chips: string[] = [
    t("ai.assistant.chip.bookings", lang),
    t("ai.assistant.chip.revenue", lang),
    t("ai.assistant.chip.invoice", lang),
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => toggle(true)}
          className="fixed bottom-4 left-4 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:opacity-90 transition-opacity"
          aria-label={t("ai.assistant.title", lang)}
          style={{ height: 52, width: 52 }}
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-4 left-4 z-50 flex flex-col rounded-2xl border bg-card text-card-foreground shadow-2xl overflow-hidden"
          style={{ width: size.w, height: size.h, maxWidth: "min(92vw, 640px)", maxHeight: "calc(100vh - 2rem)" }}
        >
          {/* header */}
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{t("ai.assistant.title", lang)}</span>
            <div className="flex-1" />
            <button onClick={clear} className="rounded p-1.5 hover:bg-muted" aria-label={t("ai.assistant.clear", lang)} title={t("ai.assistant.clear", lang)}><Trash2 className="h-4 w-4" /></button>
            <button onClick={() => toggle(false)} className="rounded p-1.5 hover:bg-muted" aria-label={t("ai.assistant.collapse", lang)} title={t("ai.assistant.collapse", lang)}><Minus className="h-4 w-4" /></button>
          </div>

          {/* messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={"max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " + (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">{t("ai.assistant.thinking", lang)}</div>
              </div>
            )}
            {error && <div className="text-xs text-destructive px-1">{error}</div>}
          </div>

          {/* quick chips */}
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {chips.map((c) => (
              <button key={c} onClick={() => ask(c)} className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted">
                {c}
              </button>
            ))}
          </div>

          {/* input */}
          <div className="border-t p-2">
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
                placeholder={t("ai.assistant.placeholder", lang)}
                rows={2}
                className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button onClick={() => ask(text)} disabled={loading || !text.trim()} className="rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-40" aria-label={t("ai.assistant.send", lang)}>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* resize handle */}
          <div onPointerDown={onResizeStart} className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize text-muted-foreground" aria-hidden>
            <svg viewBox="0 0 20 20" className="h-5 w-5"><path d="M13 2 L2 13 M16 6 L6 16 M18 11 L11 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          </div>
        </div>
      )}
    </>
  );
}
