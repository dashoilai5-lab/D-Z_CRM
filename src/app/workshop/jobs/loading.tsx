import { GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted/60 animate-pulse" />
      <GridSkeleton cols={5} rows={1} card="h-64" />
    </div>
  );
}
