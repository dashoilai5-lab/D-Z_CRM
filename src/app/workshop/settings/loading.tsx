import { CardSkeleton } from "@/components/shared/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 rounded-lg bg-muted/60 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} h="h-32" />)}
    </div>
  );
}
