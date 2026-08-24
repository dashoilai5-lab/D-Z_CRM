// Shared loading skeletons — pure visual placeholders for route-level loading.tsx.
export function CardSkeleton({ h = "h-28" }: { h?: string }) {
  return (
    <div className={"rounded-2xl border bg-card p-4 " + h}>
      <div className="h-3 w-1/3 rounded bg-muted dz-shimmer" />
      <div className="mt-3 h-6 w-1/2 rounded bg-muted/70 dz-shimmer" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted/50 dz-shimmer" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="dz-panel overflow-hidden">
      <div className="h-10 bg-muted/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-muted/70 dz-shimmer" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 rounded bg-muted/70 dz-shimmer" />
            <div className="h-3 w-1/2 rounded bg-muted/50 dz-shimmer" />
          </div>
          <div className="h-5 w-16 rounded-full bg-muted/60 dz-shimmer" />
        </div>
      ))}
    </div>
  );
}

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function GridSkeleton({ cols = 3, rows = 2, card = "h-40" }: { cols?: number; rows?: number; card?: string }) {
  return (
    <div className={"grid grid-cols-1 " + (GRID_COLS[cols] ?? "lg:grid-cols-3") + " gap-3"}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className={"rounded-2xl border bg-card p-4 " + card}>
          <div className="h-3 w-2/3 rounded bg-muted dz-shimmer" />
          <div className="mt-3 h-5 w-1/2 rounded bg-muted/70 dz-shimmer" />
          <div className="mt-2 h-3 w-1/3 rounded bg-muted/50 dz-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: n }).map((_, i) => <CardSkeleton key={i} h="h-24" />)}
    </div>
  );
}