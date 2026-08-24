import { LoadingShell } from "@/components/shared/loading-shell";
import { TableSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-4">
      <div className="h-8 w-44 rounded-lg bg-muted/60 animate-pulse" />
      <GridSkeleton cols={2} rows={1} card="h-16" />
      <TableSkeleton rows={5} />
    </div>
      </LoadingShell>
  );
}
