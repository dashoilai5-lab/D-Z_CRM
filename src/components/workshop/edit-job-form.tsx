"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateJobDetails } from "@/actions/workshop";
import { formatRM } from "@/lib/money";
import { SERVICE_CATALOG, servicesForType } from "@/lib/service-catalog";

export interface EditJobData {
  jobId: string;
  mileage: number;
  customerRequest: string | null;
  mechanicId: string | null;
  motorcycleType: string;
  items: { id: string; description: string; kind: "item" | "part"; unitPriceSen: number; status: string }[];
}
export interface MechanicOption { id: string; name: string }

export function EditJobForm({ data, mechanics }: { data: EditJobData; mechanics: MechanicOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState(String(data.mileage));
  const [request, setRequest] = useState(data.customerRequest ?? "");
  const [mechanicId, setMechanicId] = useState(data.mechanicId ?? "");
  const [extra, setExtra] = useState<Record<string, { label: string; priceSen: number }>>({});

  const applicable = servicesForType(data.motorcycleType).flatMap((g) => g.items);
  const extras = applicable.length > 0 ? applicable : [...SERVICE_CATALOG];

  const save = () =>
    start(async () => {
      await updateJobDetails({
        jobId: data.jobId,
        mileage: Number(mileage) || 0,
        customerRequest: request || undefined,
        mechanicId: mechanicId || null,
      });
      setOpen(false);
      router.refresh();
      toast.success("Job details updated");
    });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
        <Pencil className="h-3.5 w-3.5" /> Edit Details
      </button>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm">Edit Job Details</div>
        <button onClick={() => setOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Mileage (km)</Label>
          <Input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Mechanic</Label>
          <Select value={mechanicId} onValueChange={(v) => setMechanicId(v ?? "")}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Unassigned" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {mechanics.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Customer Request</Label>
          <Input value={request} onChange={(e) => setRequest(e.target.value)} placeholder="—" className="mt-1.5" />
        </div>
      </div>

      <div className="mt-4">
        <Label>Add Additional Service</Label>
        <div className="mt-1.5 space-y-1">
          {extras.map((s) => {
            const active = !!extra[s.key];
            return (
              <div key={s.key} className={"flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm " + (active ? "border-emerald-300 bg-emerald-50/40" : "")}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => setExtra((prev) => {
                    const next = { ...prev };
                    if (next[s.key]) delete next[s.key];
                    else next[s.key] = { label: s.label, priceSen: s.defaultPriceSen };
                    return next;
                  })}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="flex-1 truncate">{s.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatRM(s.defaultPriceSen)}</span>
              </div>
            );
          })}
        </div>
        {Object.keys(extra).length > 0 && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {Object.keys(extra).length} service(s) marked — they will be added on save. (Line-based add with prices coming next.)
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
        <Button className="flex-1" disabled={pending} onClick={save}><Check className="h-4 w-4 mr-1.5" /> {pending ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
