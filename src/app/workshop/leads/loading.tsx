import { LoadingShell } from "@/components/shared/loading-shell";
import { TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-9 w-28 rounded-md bg-muted/50 animate-pulse" />
      </div>
      <TableSkeleton rows={6} />
    </div>
      </LoadingShell>
  );
}
