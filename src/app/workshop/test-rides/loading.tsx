import { LoadingShell } from "@/components/shared/loading-shell";
import { GridSkeleton, StatsSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <LoadingShell>
      <div className="space-y-4">
        <StatsSkeleton n={3} />
        <GridSkeleton cols={3} rows={2} />
      </div>
    </LoadingShell>
  );
}
