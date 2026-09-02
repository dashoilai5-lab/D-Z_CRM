"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

type ImportKind = "customers" | "motorcycles" | "products";

const KIND_META: Record<ImportKind, { labelKey: string; api: string; descKey: string; template: string }> = {
  customers: {
    labelKey: "import.kind.customers",
    api: "/api/import/customers",
    descKey: "import.desc.customers",
    template: "/csv-templates/customers.csv",
  },
  motorcycles: {
    labelKey: "import.kind.motorcycles",
    api: "/api/import/motorcycles",
    descKey: "import.desc.motorcycles",
    template: "/csv-templates/motorcycles.csv",
  },
  products: {
    labelKey: "import.kind.products",
    api: "/api/import/products",
    descKey: "import.desc.products",
    template: "/csv-templates/products.csv",
  },
};

export default function ImportPage() {
  const router = useRouter();
  const lang = useLang();
  const [kind, setKind] = useState<ImportKind>("customers");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ imported: number; failed: number; duplicates: number; errors: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const meta = KIND_META[kind];

  /** Standard CSV parser — handles quoted fields with commas and "" escapes
   *  (behaviour identical to the old simple split for unquoted rows). */
  function parseCSV(text: string) {
    const rows: string[][] = [];
    let field = "", row: string[] = [], inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"' && field === "") {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.some((c) => c.trim().length > 0)) rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
    row.push(field);
    if (row.some((c) => c.trim().length > 0)) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    return rows.slice(1).map((line) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (line[i] ?? "").trim(); });
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
    const res = await fetch(meta.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const data = await res.json();
    setResult(data);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("import.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("import.subtitle", lang)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(KIND_META) as ImportKind[]).map((k) => (
          <button
            key={k}
            onClick={() => { setKind(k); setRows([]); setFileName(""); setResult(null); }}
            className={"rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors " + (k === kind ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary/40")}
          >
            {t(KIND_META[k].labelKey, lang)}
          </button>
        ))}
        <a href={meta.template} download className="ml-auto inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent">
          <Download className="h-3.5 w-3.5" /> {t("import.template", lang)}
        </a>
      </div>

      <p className="text-sm text-muted-foreground">{t(meta.descKey, lang)}</p>

      <div className="rounded-xl border bg-card p-5">
        <label className="block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground hover:bg-accent/40">
          {fileName || t("import.choose-file", lang)}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>
        {rows.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">{tpl("import.rows-preview", lang, { n: rows.length })}</p>
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
              {busy ? t("import.importing", lang) : tpl("import.import-rows", lang, { n: rows.length })}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold text-sm mb-2">{t("import.result", lang)}</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 p-2 text-center font-bold">{tpl("import.imported", lang, { n: result.imported })}</div>
            <div className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 p-2 text-center font-bold">{tpl("import.duplicates", lang, { n: result.duplicates })}</div>
            <div className="rounded-lg bg-destructive/10 text-destructive p-2 text-center font-bold">{tpl("import.failed", lang, { n: result.failed })}</div>
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
