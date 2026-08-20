import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted/60 animate-pulse" />
      <CardSkeleton h="h-36" />
      <CardSkeleton h="h-28" />
      <GridSkeleton cols={2} rows={1} card="h-24" />
    </div>
  );
}
