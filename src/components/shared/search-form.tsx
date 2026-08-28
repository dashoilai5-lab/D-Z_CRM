"use client";

import { useState } from "react";

/** Wrap any native GET filter/search form to show a brief "Searching…" indicator
 *  on submit. Does NOT prevent default submission — the core navigation logic
 *  is untouched; the route-level loading.tsx skeleton takes over afterwards. */
export function PendingForm({
  children,
  className = "",
  label = "Searching…",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <form method="get" className={"relative " + className} onSubmit={() => setPending(true)} {...rest}>
      {children}
      {pending && (
        <span className="absolute -top-3 right-2 z-20 inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm animate-pulse">
          <span className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
          {label}
        </span>
      )}
    </form>
  );
}

type KV = { label: string; value: number };

/** CSV export button with an "Exporting…" busy state.
 *  - href mode: fetches the export endpoint and downloads the blob (customers page).
 *  - inline mode: builds the CSV from the passed data client-side (analytics tabs). */
export function ExportCsvButton({
  href,
  name,
  data,
  label = "Export CSV",
  className = "",
}: {
  href?: string;
  name?: string;
  data?: KV[];
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      let blob: Blob;
      let fileName: string;
      if (href) {
        const res = await fetch(href);
        blob = await res.blob();
        fileName = (href.split("type=")[1] ?? "export").split("&")[0] + ".csv";
      } else if (data && name) {
        const csv = "label,value\n" + data.map((r) => r.label + "," + r.value).join("\n");
        blob = new Blob([csv], { type: "text/csv" });
        fileName = name + ".csv";
      } else {
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      // keep the busy state visible long enough to register as feedback
      await new Promise((r) => setTimeout(r, 450));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={"inline-flex items-center gap-1.5 disabled:opacity-60 " + className}
    >
      {busy && <span className="h-3 w-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />}
      {busy ? "Exporting…" : label}
    </button>
  );
}
