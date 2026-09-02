// Server-compatible pagination controls — pure <Link>s, keeps existing searchParams.
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export async function Pagination({
  basePath,
  page,
  totalPages,
  query = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  /** extra search params to preserve (e.g. { q, status }) — falsy values dropped */
  query?: Record<string, string | undefined>;
}) {
  const lang = await getLang();
  if (totalPages <= 1) return null;
  const mk = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return basePath + (s ? "?" + s : "");
  };

  // page numbers with ellipsis for long ranges (1 … 4 5 6 … 12)
  const pages: number[] = [];
  const add = (p: number) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
  add(1);
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p);
  add(totalPages);
  const sorted = [...pages].sort((a, b) => a - b);
  const rendered: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of sorted) {
    if (prev != null && p - prev > 1) rendered.push("…");
    rendered.push(p);
    prev = p;
  }

  const cls = (active: boolean) =>
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium transition-colors " +
    (active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground");

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-5" aria-label={t("pag.label", lang)}>
      {page > 1 ? (
        <Link href={mk(page - 1)} className={cls(false)} aria-label={t("pag.prev", lang)}><ChevronLeft className="h-3.5 w-3.5" /></Link>
      ) : (
        <span className={cls(false) + " opacity-40 pointer-events-none"} aria-hidden><ChevronLeft className="h-3.5 w-3.5" /></span>
      )}
      {rendered.map((p, i) =>
        p === "…" ? (
          <span key={"e" + i} className="px-1 text-xs text-muted-foreground">…</span>
        ) : (
          <Link key={p} href={mk(p)} className={cls(p === page)} aria-current={p === page ? "page" : undefined}>{p}</Link>
        )
      )}
      {page < totalPages ? (
        <Link href={mk(page + 1)} className={cls(false)} aria-label={t("pag.next", lang)}><ChevronRight className="h-3.5 w-3.5" /></Link>
      ) : (
        <span className={cls(false) + " opacity-40 pointer-events-none"} aria-hidden><ChevronRight className="h-3.5 w-3.5" /></span>
      )}
    </nav>
  );
}
