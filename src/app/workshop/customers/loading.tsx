import { StatsSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <StatsSkeleton n={4} />
      <TableSkeleton rows={7} />
    </div>
  );
}
