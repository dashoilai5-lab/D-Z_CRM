import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, subtitle, backHref, action }: { title: React.ReactNode; subtitle?: string; backHref?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {backHref && (
        <Link href={backHref} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
