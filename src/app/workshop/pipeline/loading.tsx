import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-5">
      <CardSkeleton h="h-20" />
      <GridSkeleton cols={4} rows={2} card="h-40" />
    </div>
      </LoadingShell>
  );
}
