import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <LoadingShell>
      <div className="space-y-4">
        <CardSkeleton h="h-24" />
        <CardSkeleton h="h-40" />
        <GridSkeleton cols={2} rows={2} card="h-24" />
      </div>
    </LoadingShell>
  );
}
