"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addMotorcycle } from "@/actions/rider";
import { MOTORCYCLE_TYPES, motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { servicesForType } from "@/lib/service-catalog";

const BRAND_SUGGESTIONS = ["Yamaha", "Honda", "Modenas", "Kawasaki", "Suzuki", "KTM", "Benelli", "Vespa", "SYM", "CFMOTO"];
const COLORS = ["Black", "Red", "Blue", "White", "Grey", "Silver", "Green", "Orange"];
const THIS_YEAR = new Date().getFullYear();

export function AddMotorcycle({ customerId, onDone }: { customerId: string; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [brand, setBrand] = useState("Yamaha");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(THIS_YEAR - 1));
  const [type, setType] = useState("UNDERBONE");
  const [color, setColor] = useState("Black");
  const [mileage, setMileage] = useState("1000");

  const typeInfo = motorcycleTypeInfo(type);
  const services = servicesForType(type);

  const submit = () =>
    start(async () => {
      if (!model.trim()) { toast.error("Enter the model name"); return; }
      const y = Number(year);
      if (y < 1990 || y > THIS_YEAR + 1) { toast.error("Enter a valid year"); return; }
      await addMotorcycle({
        customerId,
        brand,
        model,
        year: y,
        type,
        color,
        currentMileage: Math.max(0, Number(mileage) || 0),
      });
      toast.success("Motorcycle added to your garage");
      onDone();
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Brand</Label>
          <Select value={brand} onValueChange={(v) => setBrand(v ?? "Yamaha")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BRAND_SUGGESTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Model</Label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. NMAX155" className="mt-1.5" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Year</Label>
          <Select value={year} onValueChange={(v) => setYear(v ?? String(THIS_YEAR - 1))}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 36 }, (_, i) => THIS_YEAR - 1 - i).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Color</Label>
          <Select value={color} onValueChange={(v) => setColor(v ?? "Black")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Current Mileage (km)</Label>
          <Input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label>Motorcycle Type</Label>
        <p className="text-[11px] text-muted-foreground mt-0.5">Pick the style that best matches — this drives your service recommendations</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MOTORCYCLE_TYPES.map((t) => {
            const active = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={
                  "rounded-xl border p-3 text-left transition-colors " +
                  (active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card hover:border-primary/40")
                }
              >
                <div className="flex items-center justify-between">
                  <span className={"text-sm font-semibold " + (active ? "text-primary" : "")}>{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.relevance}★</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.labelBM} · {t.malaysiaTerm}</div>
              </button>
            );
          })}
        </div>
      </div>

      {typeInfo && services.length > 0 && (
        <div className="rounded-2xl border bg-muted/30 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recommended services for {typeInfo.label}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {typeInfo.serviceFocus.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{s}</span>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full" size="lg" disabled={pending || !model.trim()} onClick={submit}>
        {pending ? "Adding…" : "ADD MOTORCYCLE"}
      </Button>
    </div>
  );
}
