"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingAction } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export interface PackageOption { id: string; name: string; priceSen: number; isBestValue?: boolean }

export function BookingActions({ bookingId, status, packages, servicePackageName, serviceAddons }: { bookingId: string; status: string; packages: PackageOption[]; servicePackageName?: string; serviceAddons?: { description?: string }[] }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [packageId, setPackageId] = useState("none"); // "none" = no package (must match a SelectItem value)

  const run = (action: "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "NO_SHOW") =>
    start(async () => {
      await bookingAction(bookingId, action); router.refresh();
      const label = action === "CONFIRMED" ? t("toast.action-confirmed", lang) : action === "RESCHEDULED" ? t("toast.action-rescheduled", lang) : action === "CANCELLED" ? t("toast.action-cancelled", lang) : t("toast.action-no-show", lang);
      toast.success(tpl("toast.booking-action", lang, { action: label }));
    });

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {status === "REQUESTED" && <Button size="sm" variant="outline" disabled={pending} onClick={() => run("CONFIRMED")}>Confirm</Button>}
      {status === "REQUESTED" && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("CANCELLED")}>Cancel</Button>}
      {(status === "REQUESTED" || status === "CONFIRMED") && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("NO_SHOW")}>No Show</Button>}
      {status === "CONFIRMED" && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("RESCHEDULED")}>Reschedule</Button>}
      {(status === "REQUESTED" || status === "CONFIRMED") && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            Check In
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check in motorcycle</DialogTitle>
              <DialogDescription>Create the service job from this booking. Enter the current mileage.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {(servicePackageName || (serviceAddons && serviceAddons.length > 0)) && (
                <div className="rounded-xl bg-muted/50 p-3 text-xs">
                  <div className="font-semibold mb-1">Booking service</div>
                  {servicePackageName && <div className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> {servicePackageName}</div>}
                  {(serviceAddons ?? []).filter((a) => a.description).map((a) => (
                    <div key={a.description} className="flex items-center gap-1 mt-0.5"><Check className="h-3 w-3 text-primary" /> {a.description}</div>
                  ))}
                </div>
              )}
              <div>
                <Label>Current Mileage (km)</Label>
                <Input data-testid="checkin-mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 31800" className="mt-1.5" />
              </div>
              <div>
                <Label>Service Package</Label>
                <Select value={packageId} onValueChange={(v) => setPackageId(v ?? "")}>
                  <SelectTrigger data-testid="checkin-package" className="mt-1.5"><SelectValue>{(v) => (v === "none" ? "No package" : packages.find((p) => p.id === v)?.name ?? "Recommended at counter")}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No package</SelectItem>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} RM{p.priceSen / 100}{p.isBestValue ? " (Best value)" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button data-testid="checkin-submit" disabled={!mileage || pending} onClick={() => start(async () => {
                const result = await bookingAction(bookingId, "CHECKED_IN", { mileage: Number(mileage), packageId: packageId === "none" ? undefined : packageId });
                setOpen(false);
                router.refresh();
                if (result.ok && result.result) { toast.success(tpl("toast.checked-in", lang, { job: result.result.jobNumber })); router.push("/workshop/jobs/" + result.result.jobId); }
                else if (!result.ok) { toast.error(result.error ?? "Check in failed"); }
              })}>Check In</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
