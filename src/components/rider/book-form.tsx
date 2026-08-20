"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookService } from "@/actions/rider";
import { SERVICE_CATALOG, servicesForType } from "@/lib/service-catalog";
import { motorcycleTypeInfo, MOTORCYCLE_TYPE_LABELS } from "@/lib/motorcycle-types";
import { cn } from "@/lib/utils";
import { formatRM } from "@/lib/money";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** Module-level constant — Date.now() at module load, not per render. */
const TOMORROW = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export interface BikeOption { id: string; brand: string; model: string; plate: string; type: string }
export interface PackageOption { id: string; name: string; tier: string; priceSen: number; isBestValue?: boolean; description?: string | null }

export function BookForm({ customerId, bikes, packages, campaignId, availableSlots = [], branchId }: {
  customerId: string; bikes: BikeOption[]; packages: PackageOption[]; campaignId?: string | null; availableSlots?: { date: string; time: string }[]; branchId?: string;
}) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [motorcycleId, setMotorcycleId] = useState(bikes[0]?.id ?? "");
  const [packageId, setPackageId] = useState("");
  const [extras, setExtras] = useState<Record<string, { label: string; priceSen: number }>>({});
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00");
  // BOOK-008: only slots configured & available for the picked date
  const daySlots = date
    ? [...new Set(availableSlots.filter((s) => s.date === date).map((s) => s.time))].sort()
    : [];
  const slotOptions = daySlots.length > 0 ? daySlots : ["10:00", "11:00", "14:00", "16:00"];
  const [notes, setNotes] = useState("");

  const selectedBike = bikes.find((b) => b.id === motorcycleId);
  const bikeType = selectedBike ? motorcycleTypeInfo(selectedBike.type) : undefined;
  // additional services applicable to the bike type (workshop-style)
  const serviceGroups = selectedBike ? servicesForType(selectedBike.type) : [];
  const groupedServices = serviceGroups.length > 0 ? serviceGroups : [{ family: "All Services", items: [...SERVICE_CATALOG] }];

  const pkg = packages.find((p) => p.id === packageId);
  const extrasList = Object.values(extras);
  const totalSen = (pkg?.priceSen ?? 0) + extrasList.reduce((s, x) => s + x.priceSen, 0);

  const submit = () =>
    start(async () => {
      if (!date) { toast.error(t("toast.pick-date", lang)); return; }
      if (!timeSlot) { toast.error(t("toast.pick-time", lang)); return; }
      // build a readable service summary: package + selected extras
      const serviceType = [
        pkg?.name,
        ...extrasList.map((x) => x.label),
      ].filter(Boolean).join(" + ") || "General Checkup";
      await bookService({ customerId, motorcycleId, serviceType, date, timeSlot, notes: notes || undefined, campaignId: campaignId || undefined, branchId });
      router.push("/rider/bookings");
      toast.success(t("toast.booking-requested", lang));
    });

  return (
    <div className="space-y-5">
      {/* motorcycle */}
      <div>
        <Label>Motorcycle</Label>
        <Select value={motorcycleId} onValueChange={(v) => { setMotorcycleId(v ?? ""); setPackageId(""); setExtras({}); }}>
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

      {/* package — single select (workshop-style) */}
      <div>
        <div className="flex items-baseline justify-between">
          <Label>Service Package</Label>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Pick one</span>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {packages.map((p) => {
            const active = packageId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPackageId(active ? "" : p.id)}
                className={cn(
                  "relative rounded-2xl border p-3 text-left transition-colors",
                  active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card hover:border-primary/40"
                )}
              >
                {active && (
                  <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{p.tier}</div>
                <div className="mt-0.5 text-sm font-semibold leading-tight">{p.name}</div>
                <div className="mt-1 text-base font-bold tabular-nums">{formatRM(p.priceSen)}</div>
                {p.isBestValue && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">BEST VALUE</span>
                )}
              </button>
            );
          })}
        </div>
        {pkg?.description && <p className="mt-1.5 text-[11px] text-muted-foreground">{pkg.description}</p>}
      </div>

      {/* additional services — multi-select */}
      <div>
        <div className="flex items-baseline justify-between">
          <Label>Additional Services</Label>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Select any</span>
        </div>
        <div className="mt-1.5 space-y-2.5">
          {groupedServices.map((g) => (
            <div key={g.family}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{g.family}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {g.items.map((s) => {
                  const active = !!extras[s.key];
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setExtras((prev) => {
                        const next = { ...prev };
                        if (next[s.key]) delete next[s.key];
                        else next[s.key] = { label: s.label, priceSen: s.defaultPriceSen };
                        return next;
                      })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1",
                        active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {s.label}
                      <span className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>· {formatRM(s.defaultPriceSen)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* summary */}
      <div className="rounded-2xl border bg-muted/30 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</div>
        <div className="mt-2 space-y-1 text-sm">
          {pkg && (
            <div className="flex justify-between"><span>{pkg.name}</span><span className="tabular-nums">{formatRM(pkg.priceSen)}</span></div>
          )}
          {extrasList.map((x) => (
            <div key={x.label} className="flex justify-between text-xs"><span>{x.label}</span><span className="tabular-nums">{formatRM(x.priceSen)}</span></div>
          ))}
          {!pkg && extrasList.length === 0 && <p className="text-xs text-muted-foreground">No services selected yet.</p>}
          <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold"><span>Estimated Total</span><span className="tabular-nums">{formatRM(totalSen)}</span></div>
        </div>
      </div>

      {/* schedule */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <input type="date" min={TOMORROW} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <Label>Time</Label>
          <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v ?? "")}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder={daySlots.length > 0 ? "Pick a slot" : "Pick a time"} /></SelectTrigger>
            <SelectContent>
              {slotOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {daySlots.length === 0 && date && <p className="mt-1 text-[11px] text-muted-foreground">No configured slots that day — a default time will be used.</p>}
        </div>
      </div>
      <div>
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" className="mt-1.5" rows={3} />
      </div>
      <Button className="w-full" size="lg" data-testid="book-submit" disabled={pending || !motorcycleId || !date || !timeSlot} onClick={submit}>
        <Bike className="h-4 w-4 mr-2" /> {pending ? "Sending…" : "REQUEST BOOKING"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">The workshop receives your request instantly and confirms the slot.</p>
    </div>
  );
}
