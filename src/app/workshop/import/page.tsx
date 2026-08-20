"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ imported: number; failed: number; duplicates: number; errors: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
      return obj;
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRows(parseCSV(text));
    setResult(null);
  }

  async function doImport() {
    setBusy(true);
    const res = await fetch("/api/import/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const data = await res.json();
    setResult(data);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">CSV Import</h1>
        <p className="text-sm text-muted-foreground">Import customers from CSV. Columns: <code className="rounded bg-muted px-1">name, phone, email, address, tags, notes</code> — phone duplicates are skipped, never overwritten (IMPORT-012).</p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <label className="block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground hover:bg-accent/40">
          {fileName || "Click to choose a CSV file"}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>
        {rows.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">{rows.length} rows parsed — preview:</p>
            <div className="rounded-md border max-h-44 overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>{Object.keys(rows[0]).map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((r, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(r).map((v, j) => <td key={j} className="px-2 py-1 truncate max-w-32">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-3 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={busy} onClick={doImport}>
              {busy ? "Importing…" : "Import " + rows.length + " rows"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold text-sm mb-2">Result</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-emerald-500/10 text-emerald-600 p-2 text-center font-bold">{result.imported} imported</div>
            <div className="rounded-lg bg-amber-500/10 text-amber-600 p-2 text-center font-bold">{result.duplicates} duplicates skipped</div>
            <div className="rounded-lg bg-destructive/10 text-destructive p-2 text-center font-bold">{result.failed} failed</div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 max-h-40 overflow-auto rounded-md bg-muted/50 p-3 space-y-1">
              {result.errors.map((e, i) => <p key={i} className="text-[11px] text-muted-foreground">{e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
