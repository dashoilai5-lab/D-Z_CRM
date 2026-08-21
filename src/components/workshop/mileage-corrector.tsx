"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { correctMileage } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

/** Mileage correction (hardening): fixes a wrong odometer reading on a job —
 *  updates the job + motorcycle and writes an MILEAGE_CORRECTION audit entry. */
export function MileageCorrector({ jobId, currentMileage, bikeMileage }: { jobId: string; currentMileage: number; bikeMileage: number }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState(String(currentMileage));
  const [reason, setReason] = useState("");

  const submit = () =>
    start(async () => {
      const v = Number(mileage);
      if (!Number.isFinite(v) || v < 0) { toast.error(t("toast.valid-mileage", lang)); return; }
      const res = await correctMileage({ jobId, newMileage: v, reason });
      if (!res.ok) { toast.error(res.error ?? t("toast.failed", lang)); return; }
      toast.success(res.changed ? t("toast.mileage-corrected", lang) : t("toast.mileage-unchanged", lang));
      setOpen(false);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="ml-2 inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
        <Pencil className="h-3 w-3" />{t("ws.job.correct-mileage", lang)}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ws.job.correct-mileage-title", lang)}</DialogTitle>
          <DialogDescription>
            {tpl("ws.job.correct-mileage-desc", lang, { job: currentMileage.toLocaleString(), bike: bikeMileage.toLocaleString() })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="mileage">{t("ws.job.new-mileage", lang)}</Label>
            <Input id="mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="reason">{t("ws.job.reason", lang)} <span className="text-muted-foreground">({t("ws.job.optional", lang)})</span></Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("ws.job.reason-placeholder", lang)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel", lang)}</Button>
          <Button disabled={pending} onClick={submit}>{pending ? t("common.saving", lang) : t("common.save", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
