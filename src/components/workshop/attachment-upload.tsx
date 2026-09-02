"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Trash2 } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function AttachmentUpload({ customerId }: { customerId: string }) {
  const router = useRouter();
  const lang = useLang();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("relatedType", "CUSTOMER");
    fd.append("relatedId", customerId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setMsg(data.ok ? t("ws.ctrl.uploaded", lang) : data.error ?? t("ws.ctrl.upload-failed", lang));
      router.refresh();
    } catch (err) {
      setMsg(String((err as Error).message));
    }
    setBusy(false);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">
        <Paperclip className="h-3.5 w-3.5" /> {busy ? t("ws.ctrl.uploading", lang) : t("ws.ctrl.upload-attachment", lang)}
        <input type="file" className="hidden" onChange={onFile} disabled={busy} />
      </label>
      {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}
