import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <LoadingShell>
      <div className="space-y-4">
        <CardSkeleton h="h-16" />
        <GridSkeleton cols={2} rows={3} card="h-44" />
      </div>
    </LoadingShell>
  );
}
