import { CardSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-44 rounded-lg bg-muted/60 animate-pulse" />
      {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} h="h-16" />)}
    </div>
  );
}
