"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookService } from "@/actions/rider";
import { SERVICE_CATALOG, servicesForType } from "@/lib/service-catalog";
import { motorcycleTypeInfo, MOTORCYCLE_TYPE_LABELS } from "@/lib/motorcycle-types";

export interface BikeOption { id: string; brand: string; model: string; plate: string; type: string }

export function BookForm({ customerId, bikes }: { customerId: string; bikes: BikeOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [motorcycleId, setMotorcycleId] = useState(bikes[0]?.id ?? "");
  const [serviceType, setServiceType] = useState("General Checkup");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00");
  const [notes, setNotes] = useState("");

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const selectedBike = bikes.find((b) => b.id === motorcycleId);
  const bikeType = selectedBike ? motorcycleTypeInfo(selectedBike.type) : undefined;
  // services grouped by family for the selected bike type (falls back to full catalogue)
  const serviceGroups = selectedBike ? servicesForType(selectedBike.type) : [];
  const groupedServices = serviceGroups.length > 0 ? serviceGroups : [{ family: "All Services", items: [...SERVICE_CATALOG] }];

  const submit = () =>
    start(async () => {
      if (!date) { toast.error("Pick a date"); return; }
      await bookService({ customerId, motorcycleId, serviceType, date, timeSlot, notes: notes || undefined });
      router.push("/rider/bookings");
      toast.success("Booking requested — the workshop will confirm");
    });

  return (
    <div className="space-y-5">
      <div>
        <Label>Motorcycle</Label>
        <Select value={motorcycleId} onValueChange={(v) => { setMotorcycleId(v ?? ""); setServiceType("General Checkup"); }}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {bikes.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.brand} {b.model} · {b.plate}{b.type ? " · " + (MOTORCYCLE_TYPE_LABELS[b.type] ?? b.type) : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bikeType && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {bikeType.label} · {bikeType.labelBM} — recommended: {bikeType.serviceFocus.slice(0, 3).join(" · ")}
          </p>
        )}
      </div>
      <div>
        <Label>Service Type</Label>
        <div className="mt-1.5 space-y-2.5">
          {groupedServices.map((g) => (
            <div key={g.family}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{g.family}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {g.items.map((s) => {
                  const active = serviceType === s.label;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setServiceType(s.label)}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                        (active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50")
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <input type="date" min={tomorrow} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <Label>Time</Label>
          <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v ?? "")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "16:00"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" className="mt-1.5" rows={3} />
      </div>
      <Button className="w-full" size="lg" data-testid="book-submit" disabled={pending || !motorcycleId || !date} onClick={submit}>
        {pending ? "Sending…" : "REQUEST BOOKING"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">The workshop receives your request instantly and confirms the slot.</p>
    </div>
  );
}
