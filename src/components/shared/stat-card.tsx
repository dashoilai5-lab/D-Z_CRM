import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, sub, href, tone = "default", icon }: {
  label: string; value: React.ReactNode; sub?: string; href?: string; tone?: "default" | "danger" | "success" | "warn"; icon?: React.ReactNode;
}) {
  const cls =
    tone === "danger" ? "text-red-600 dark:text-red-300" :
    tone === "success" ? "text-emerald-600 dark:text-emerald-300" :
    tone === "warn" ? "text-amber-600" : "text-foreground";
  const iconBg =
    tone === "danger" ? "bg-red-50 text-red-600 dark:bg-red-950/40" :
    tone === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" :
    tone === "warn" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40" :
    "bg-primary/10 text-primary dark:bg-primary/15";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span className={"inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " + iconBg}>{icon}</span>
        ) : href ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : null}
      </div>
      <div className={"mt-2 text-2xl font-bold tracking-tight tabular-nums " + cls}>{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </>
  );
  const wrap = "rounded-2xl border bg-card p-4 shadow-sm transition-all duration-150";
  if (!href) return <div className={wrap}>{inner}</div>;
  return (
    <Link href={href} className={wrap + " hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"}>
      {inner}
    </Link>
  );
}
