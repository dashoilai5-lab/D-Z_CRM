import { CardSkeleton, GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-10 rounded-2xl bg-muted/60 animate-pulse" />
      <CardSkeleton h="h-20" />
      <CardSkeleton h="h-52" />
      <GridSkeleton cols={2} rows={1} card="h-24" />
    </div>
  );
}
