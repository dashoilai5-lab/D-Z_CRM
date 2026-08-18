import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export function ComingSoon({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center"><Construction className="h-7 w-7 text-muted-foreground" /></div>
        <p className="mt-4 font-semibold">Coming in a later phase</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc ?? "This module ships after the core workshop ↔ rider workflow is validated."}</p>
      </div>
    </div>
  );
}
