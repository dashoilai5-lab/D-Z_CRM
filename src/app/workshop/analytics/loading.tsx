import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-5">
      <div className="h-9 w-40 rounded-lg bg-muted/60 animate-pulse" />
      <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 w-20 rounded-md bg-muted/50 animate-pulse" />)}</div>
      <StatsSkeletonInline />
      <GridSkeleton cols={2} rows={2} card="h-56" />
    </div>
      </LoadingShell>
  );
}
function StatsSkeletonInline() {
  return <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} h="h-20" />)}</div>;
}
