import { StatsSkeleton, CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <StatsSkeleton n={4} />
      <StatsSkeleton n={4} />
      <CardSkeleton h="h-40" />
      <TableSkeleton rows={5} />
    </div>
  );
}
