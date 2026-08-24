import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-6 w-48 rounded bg-muted/60 animate-pulse" />
      </div>
      <CardSkeleton h="h-40" />
      <TableSkeleton rows={5} />
    </div>
      </LoadingShell>
  );
}
