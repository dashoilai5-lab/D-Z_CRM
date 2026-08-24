import { LoadingShell } from "@/components/shared/loading-shell";
import { TableSkeleton, StatsSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <LoadingShell>
      <div className="space-y-4">
        <StatsSkeleton n={2} />
        <TableSkeleton rows={6} />
      </div>
    </LoadingShell>
  );
}
