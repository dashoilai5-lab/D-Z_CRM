import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <CardSkeleton h="h-20" />
      <TableSkeleton rows={8} />
    </div>
  );
}
