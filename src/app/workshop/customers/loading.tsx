import { LoadingShell } from "@/components/shared/loading-shell";
import { StatsSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-5">
      <StatsSkeleton n={4} />
      <TableSkeleton rows={7} />
    </div>
      </LoadingShell>
  );
}
