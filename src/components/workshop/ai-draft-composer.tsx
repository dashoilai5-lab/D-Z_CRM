"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { draftMessage, sendDraft } from "@/actions/ai";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

const KINDS = [
  { value: "follow_up", label: "Follow-up" }, { value: "booking_reminder", label: "Booking reminder" },
  { value: "invoice", label: "Invoice ready" }, { value: "promo", label: "Promotion" }, { value: "service_due", label: "Service due" },
];
const TONES = ["friendly", "professional", "casual"];

export function AiDraftComposer() {
  const router = useRouter();
  const lang = useLang();
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [kind, setKind] = useState("follow_up");
  const [tone, setTone] = useState("friendly");
  const [body, setBody] = useState("");
  const [facts, setFacts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeq = useRef(0);

  async function search(v: string) {
    setQ(v);
    const seq = ++searchSeq.current;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (v.length < 2) { setCustomers([]); setSearching(false); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(v));
        const data = await res.json();
        if (seq !== searchSeq.current) return; // stale response — ignore
        const hits = (data.hits ?? []).filter((h: { type: string }) => h.type === "customer").slice(0, 5);
        setCustomers(hits.map((h: { label: string; sub: string; href: string }) => ({ id: h.href.split("/").pop() ?? "", name: h.label, phone: h.sub.split("·")[0]?.trim() ?? "" })));
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 300);
  }

  async function generate() {
    if (!customerId) { setMsg(t("toast.pick-customer-first", lang)); return; }
    setBusy(true); setMsg("");
    const res = await draftMessage({ customerId, kind: kind as "follow_up", tone });
    setBusy(false);
    if (!res.ok) { setMsg(t("toast.failed", lang)); return; }
    setBody(res.body); setFacts(res.facts);
  }

  async function send() {
    setBusy(true); setMsg("");
    const res = await sendDraft({ customerId, body, isMarketing: kind === "promo" });
    setBusy(false);
    setMsg(res.ok ? t("toast.sent-recorded", lang) : t("toast.failed", lang));
    router.refresh();
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>{t("ws.crm.return.col.customer", lang)}</label>
          <input className={inputCls + " w-full"} value={q} onChange={(e) => search(e.target.value)} placeholder={t("ai.placeholder-search", lang)} />
          {searching && <p className="text-[10px] text-muted-foreground mt-0.5 animate-pulse">{t("ai.searching", lang)}</p>}
          {customers.length > 0 && (
            <div className="mt-1 rounded-md border max-h-32 overflow-y-auto">
              {customers.map((c) => (
                <button key={c.id} type="button" className="block w-full px-3 py-1.5 text-left text-xs hover:bg-accent" onClick={() => { setCustomerId(c.id); setQ(c.name); setCustomers([]); }}>
                  {c.name} · {c.phone}
                </button>
              ))}
            </div>
          )}
          {customerId && !customers.length && <p className="text-[10px] text-emerald-600 dark:text-emerald-300 mt-0.5">{t("ai.selected", lang)}</p>}
        </div>
        <div>
          <label className={labelCls}>{t("ai.label-message-type", lang)}</label>
          <select className={inputCls + " w-full"} value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{t("ai.kind." + k.value, lang)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t("ai.label-tone", lang)}</label>
          <select className={inputCls + " w-full"} value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONES.map((tone) => <option key={tone} value={tone}>{t("ai.tone." + tone, lang)}</option>)}
          </select>
        </div>
      </div>
      <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={busy || !customerId} onClick={generate}>
        {t("ai.generate", lang)}
      </button>
      {body && (
        <div className="rounded-lg border p-3 space-y-2">
          <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[10px] text-muted-foreground">
              {tpl("ai.facts-hint", lang, { f: Object.entries(facts).filter(([, v]) => v).map(([k]) => k).join(", ") || "—" })}
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border px-3 py-1.5 text-xs font-medium" onClick={() => setBody("")}>{t("ai.discard", lang)}</button>
              <button className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-50" disabled={busy || !body.trim()} onClick={send}>{t("ai.send", lang)}</button>
            </div>
          </div>
        </div>
      )}
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
