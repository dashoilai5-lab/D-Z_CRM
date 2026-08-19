"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { MotorcycleForm, type MotorcycleDraft } from "@/components/rider/motorcycle-form";

/** Edit button + inline form for a motorcycle's details (passport page). */
export function EditMotorcycle({ motorcycleId, initial }: { motorcycleId: string; initial: MotorcycleDraft }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit Details
      </button>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm">Edit Motorcycle</div>
        <button onClick={() => setOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <MotorcycleForm motorcycleId={motorcycleId} initial={initial} onDone={() => setOpen(false)} submitLabel="SAVE CHANGES" />
    </div>
  );
}
