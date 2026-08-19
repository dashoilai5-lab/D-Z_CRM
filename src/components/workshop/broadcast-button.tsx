"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { broadcastCampaign } from "@/actions/marketing";

export function BroadcastButton({ campaignId, sentCount }: { campaignId: string; sentCount: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = () =>
    start(async () => {
      const r = await broadcastCampaign({ campaignId, message: message || undefined });
      setOpen(false);
      router.refresh();
      toast.success("Broadcast sent to " + r.sent + " customers");
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium hover:bg-muted">
        <Send className="h-3 w-3" /> Broadcast{sentCount > 0 ? " (" + sentCount + ")" : ""}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WhatsApp Broadcast</DialogTitle>
          <DialogDescription>Send this campaign to its audience via WhatsApp. Messages are recorded to customer history.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Message (optional)</Label>
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Default: campaign promo text" className="mt-1.5" />
          </div>
          {sentCount > 0 && <p className="text-xs text-muted-foreground">Previously sent to {sentCount} customers — sending again will re-broadcast.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={pending} onClick={send}><Send className="h-3.5 w-3.5 mr-1.5" /> {pending ? "Sending…" : "Send Broadcast"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
