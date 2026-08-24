import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-5">
      <CardSkeleton h="h-20" />
      <TableSkeleton rows={8} />
    </div>
      </LoadingShell>
  );
}
