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
import { Sparkles, Upload } from "lucide-react";
import { createCampaign, createPoster, createScript, updateCampaign } from "@/actions/marketing";

const TONES = [
  { id: "brand", label: "Brand", swatch: "bg-gradient-to-br from-slate-800 to-orange-500" },
  { id: "deep", label: "Deep Blue", swatch: "bg-gradient-to-br from-slate-900 to-sky-700" },
  { id: "fresh", label: "Fresh", swatch: "bg-gradient-to-br from-emerald-950 to-emerald-500" },
  { id: "bold", label: "Bold", swatch: "bg-gradient-to-br from-rose-950 to-rose-500" },
];
const SIZES = [
  { id: "SQUARE", label: "1:1 · Instagram" },
  { id: "STORY", label: "9:16 · Story" },
  { id: "BANNER", label: "16:9 · Banner" },
];

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [promo, setPromo] = useState("");
  const [tone, setTone] = useState("brand");
  const [size, setSize] = useState("SQUARE");
  const [visual, setVisual] = useState("poster");
  const [count, setCount] = useState("1");
  const [assetUrl, setAssetUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  async function onAsset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("relatedType", "POSTER_REF");
    fd.append("relatedId", "poster-ref");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) setAssetUrl(data.url);
    } catch { /* ignore */ }
    setUploading(false);
    e.target.value = "";
  }

  async function generate() {
    if (!title.trim()) return;
    setBusy(true); setResult(null);
    const res = await fetch("/api/poster/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, promo, tone, size, visual, count: parseInt(count) || 1, assetUrl: assetUrl || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setResult({ url: data.url });
      toast.success("Poster generated — added to the library");
      setOpen(false); // auto-close so the flow never feels stuck
      router.refresh();
    } else {
      setResult({ error: data.error ?? "Generation failed" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        <Sparkles className="h-4 w-4" /> Generate with AI
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate poster</DialogTitle>
          <DialogDescription>Upload a reference asset (optional), describe what you need — we compose a branded poster automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Poster title *</Label>
            <Input data-testid="poster-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Servis Musim Ini" className="mt-1.5" />
          </div>
          <div>
            <Label>Subtitle / message</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Keep your bike ready for the season" className="mt-1.5" />
          </div>
          <div>
            <Label>Promo (optional)</Label>
            <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="e.g. RM20 OFF · July" className="mt-1.5" />
          </div>
          <div>
            <Label>Tone</Label>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {TONES.map((t) => (
                <button key={t.id} type="button" onClick={() => setTone(t.id)} className={"flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs " + (tone === t.id ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40")}>
                  <span className={"h-3 w-3 rounded-full " + t.swatch} /> {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Size</Label>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {SIZES.map((s) => (
                <button key={s.id} type="button" onClick={() => setSize(s.id)} className={"rounded-lg border px-2.5 py-1.5 text-xs " + (size === s.id ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40")}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Style</Label>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {[["poster", "Graphic poster"], ["photo", "Photo style"]].map(([v, label]) => (
                <button key={v} type="button" onClick={() => setVisual(v)} className={"rounded-lg border px-2.5 py-1.5 text-xs " + (visual === v ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>How many variants</Label>
            <div className="mt-1.5 flex gap-2">
              {["1", "2", "4"].map((c) => (
                <button key={c} type="button" onClick={() => setCount(c)} className={"rounded-lg border px-3 py-1.5 text-xs " + (count === c ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40")}>
                  {c} {c === "1" ? "poster" : "posters"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Reference asset (optional — used as a visual in the poster)</Label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-accent/40">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : assetUrl ? "✓ " + assetUrl.split("/").pop() : "Upload image…"}
              <input type="file" accept="image/*" className="hidden" onChange={onAsset} disabled={uploading} />
            </label>
          </div>
          {result?.url && (
            <div className="rounded-lg border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt="Generated poster" className="w-full rounded-md border" />
            </div>
          )}
          {result?.error && <p className="text-xs text-destructive">{result.error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button data-testid="poster-generate" disabled={!title.trim() || busy} onClick={generate}>
            <Sparkles className="h-4 w-4 mr-1.5" /> {busy ? "Generating…" : "Generate poster"}
          </Button>
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
