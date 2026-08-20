import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <CardSkeleton h="h-32" />
      <CardSkeleton h="h-24" />
      <TableSkeleton rows={6} />
    </div>
  );
}
