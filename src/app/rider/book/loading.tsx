import { LoadingShell } from "@/components/shared/loading-shell";
import { CardSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
      <LoadingShell>
    <div className="space-y-4">
      <div className="h-8 w-40 rounded-lg bg-muted/60 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} h="h-24" />)}
      <CardSkeleton h="h-28" />
    </div>
      </LoadingShell>
  );
}
