import { GridSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="h-9 w-64 rounded-lg bg-muted/60 animate-pulse" />
      <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
      <GridSkeleton cols={3} rows={2} card="h-56" />
    </div>
  );
}
