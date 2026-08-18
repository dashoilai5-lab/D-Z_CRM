import { Inbox } from "lucide-react";

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"><Inbox className="h-6 w-6 text-muted-foreground" /></div>
      <p className="mt-4 font-medium">{title}</p>
      {desc && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{desc}</p>}
    </div>
  );
}
