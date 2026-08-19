"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign, createPoster, createScript, updateCampaign } from "@/actions/marketing";

function useForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const run = (fn: () => Promise<unknown>, msg: string) =>
    start(async () => { await fn(); setOpen(false); router.refresh(); toast.success(msg); });
  return { pending, open, setOpen, run };
}

const typeOptions = [["RETURN", "Return"], ["REMINDER", "Reminder"], ["PROMO", "Promo"], ["NEWS", "News"]] as const;
const statusOptions = [["DRAFT", "Draft"], ["SCHEDULED", "Scheduled"], ["ACTIVE", "Active"], ["ENDED", "Ended"]] as const;
const audienceOptions = [["ALL", "All customers"], ["30_DAYS", "Active last 30 days"], ["60_DAYS", "Active last 60 days"], ["OVERDUE", "Overdue service"], ["NEW", "New customers"]] as const;

export interface CampaignDraft {
  id: string; name: string; type: string; status: string; audience: string | null;
  startDate: Date; endDate: Date | null; discountPercent: number | null;
}

function iso(d: Date): string { return d.toISOString().slice(0, 10); }

export function CampaignForm({ initial, onDone }: { initial?: CampaignDraft; onDone?: () => void }) {
  const { pending, open, setOpen, run } = useForm();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "PROMO");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [audience, setAudience] = useState(initial?.audience ?? "ALL");
  const [startDate, setStartDate] = useState(initial ? iso(initial.startDate) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? iso(initial.endDate) : "");
  const [discount, setDiscount] = useState(initial?.discountPercent != null ? String(initial.discountPercent) : "");
  const isEdit = !!initial;

  const submit = () => {
    const payload = { name, type: type as never, status: status as never, audience, startDate, endDate: endDate || undefined, discountPercent: discount ? Number(discount) : undefined };
    if (isEdit) {
      run(() => updateCampaign({ id: initial.id, ...payload }), "Campaign updated");
    } else {
      run(() => createCampaign(payload), "Campaign created");
    }
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        {isEdit ? "Edit" : "New Campaign"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit campaign" : "New campaign"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update the campaign details." : "Plan a promotion, reminder or return campaign."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label>Name</Label><Input data-testid="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hari Merdeka Promo" className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "PROMO")}><SelectTrigger data-testid="campaign-type" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{typeOptions.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "DRAFT")}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v ?? "ALL")}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{audienceOptions.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start date</Label><Input data-testid="campaign-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" /></div>
            <div><Label>End date (optional)</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" /></div>
          </div>
          {type === "PROMO" && (
            <div><Label>Discount % (PROMO only)</Label><Input data-testid="campaign-discount" type="number" min={1} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 20" className="mt-1.5" /></div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button data-testid="campaign-submit" disabled={!name || !startDate || pending} onClick={submit}>
            {isEdit ? "Save Changes" : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PosterForm() {
  const { pending, open, setOpen, run } = useForm();
  const [title, setTitle] = useState(""); const [month, setMonth] = useState(""); const [description, setDescription] = useState(""); const [url, setUrl] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        New Poster
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New poster</DialogTitle>
          <DialogDescription>Add a monthly poster pack (mocked AI content in the prototype).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label>Title</Label><Input data-testid="poster-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Servis Musim Ini" className="mt-1.5" /></div>
          <div><Label>Month</Label><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1.5" /></div>
          <div><Label>Image URL (optional)</Label><Input data-testid="poster-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/poster.png — real image replaces the placeholder" className="mt-1.5" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short tagline for the poster" className="mt-1.5" rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button data-testid="poster-submit" disabled={!title || pending} onClick={() => run(
            () => createPoster({ title, month: month || undefined, description: description || undefined, url: url || undefined }),
            "Poster added"
          )}>Add Poster</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScriptForm() {
  const { pending, open, setOpen, run } = useForm();
  const [title, setTitle] = useState(""); const [platform, setPlatform] = useState("TIKTOK"); const [hook, setHook] = useState(""); const [body, setBody] = useState(""); const [tone, setTone] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        New Script
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New reels script</DialogTitle>
          <DialogDescription>TikTok / Reels script template for the workshop.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label>Title</Label><Input data-testid="script-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chain & Sprocket Check" className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v ?? "TIKTOK")}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="TIKTOK">TikTok</SelectItem><SelectItem value="REELS">Reels</SelectItem><SelectItem value="YT_SHORTS">YT Shorts</SelectItem></SelectContent></Select>
            </div>
            <div><Label>Tone</Label><Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. casual, urgent" className="mt-1.5" /></div>
          </div>
          <div><Label>Hook (first 3 seconds)</Label><Input data-testid="script-hook" value={hook} onChange={(e) => setHook(e.target.value)} placeholder="e.g. Your chain is dangerous…" className="mt-1.5" /></div>
          <div><Label>Script body</Label><Textarea data-testid="script-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Scene-by-scene script…" className="mt-1.5" rows={5} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button data-testid="script-submit" disabled={!title || !body || pending} onClick={() => run(
            () => createScript({ title, platform, hook: hook || undefined, body, tone: tone || undefined }),
            "Script added"
          )}>Add Script</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
