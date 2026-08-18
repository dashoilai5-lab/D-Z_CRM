"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingAction } from "@/actions/workshop";

export interface PackageOption { id: string; name: string; priceSen: number; isBestValue?: boolean }

export function BookingActions({ bookingId, status, packages }: { bookingId: string; status: string; packages: PackageOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [packageId, setPackageId] = useState("");

  const run = (action: "CONFIRMED" | "RESCHEDULED" | "CANCELLED") =>
    start(async () => { await bookingAction(bookingId, action); router.refresh(); toast.success("Booking " + action.toLowerCase()); });

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {status === "REQUESTED" && <Button size="sm" variant="outline" disabled={pending} onClick={() => run("CONFIRMED")}>Confirm</Button>}
      {status === "REQUESTED" && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("CANCELLED")}>Cancel</Button>}
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
              <div>
                <Label>Current Mileage (km)</Label>
                <Input data-testid="checkin-mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 31800" className="mt-1.5" />
              </div>
              <div>
                <Label>Service Package</Label>
                <Select value={packageId} onValueChange={(v) => setPackageId(v ?? "")}>
                  <SelectTrigger data-testid="checkin-package" className="mt-1.5"><SelectValue placeholder="Recommended at counter" /></SelectTrigger>
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
                if (result.ok && result.result) { toast.success("Checked in — job " + result.result.jobNumber + " created"); router.push("/workshop/jobs/" + result.result.jobId); }
              })}>Check In</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
