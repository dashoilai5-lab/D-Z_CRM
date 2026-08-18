import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, sub, href, tone = "default" }: {
  label: string; value: React.ReactNode; sub?: string; href?: string; tone?: "default" | "danger" | "success" | "warn";
}) {
  const cls =
    tone === "danger" ? "text-red-600" :
    tone === "success" ? "text-emerald-600" :
    tone === "warn" ? "text-amber-600" : "";
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {href && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className={"mt-2 text-2xl font-bold tracking-tight tabular-nums " + cls}>{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </>
  );
  if (!href) return <div className="rounded-2xl border bg-card p-4">{inner}</div>;
  return (
    <Link href={href} className="block rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
      {inner}
    </Link>
  );
}
