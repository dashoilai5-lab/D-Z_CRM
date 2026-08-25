"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addMotorcycle, updateMotorcycle } from "@/actions/rider";
import { MOTORCYCLE_TYPES, motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { servicesForType } from "@/lib/service-catalog";
import { BIKE_BRANDS, modelsForBrand, OTHERS } from "@/lib/bike-models";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

const COLORS = ["Black", "Red", "Blue", "White", "Grey", "Silver", "Green", "Orange"];
const THIS_YEAR = new Date().getFullYear();

export interface MotorcycleDraft {
  brand: string;
  model: string;
  year: number;
  type: string;
  color?: string | null;
  currentMileage: number;
}

/**
 * Reusable motorcycle form in create or edit mode.
 * - create: needs customerId, generates a plate, next service = +3000 km.
 * - edit: needs motorcycleId, prefills from initial, preserves plate/ownership.
 */
export function MotorcycleForm({
  customerId,
  motorcycleId,
  initial,
  onDone,
  submitLabel = "SAVE",
}: {
  customerId?: string;
  motorcycleId?: string;
  initial?: MotorcycleDraft;
  onDone: () => void;
  submitLabel?: string;
}) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();

  const [brand, setBrand] = useState(initial?.brand ?? "Yamaha");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState(initial?.model ?? "");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState(String(initial?.year ?? THIS_YEAR - 1));
  const [type, setType] = useState(initial?.type ?? "UNDERBONE");
  const [color, setColor] = useState(initial?.color ?? "Black");
  const [mileage, setMileage] = useState(String(initial?.currentMileage ?? 1000));

  // brand: if the current brand isn't in the preset list, treat as custom
  const brandInList = BIKE_BRANDS.includes(brand as never);
  const brandIsCustom = !brandInList || brand === OTHERS;
  const effectiveBrand = brandIsCustom ? customBrand.trim() || brand : brand;
  const models = modelsForBrand(brandInList && brand !== OTHERS ? brand : "Yamaha");
  const modelInList = !brandIsCustom && models.includes(model);
  const modelIsCustom = model === OTHERS || !modelInList;
  const effectiveModel = modelIsCustom ? customModel.trim() || model : model;

  const typeInfo = motorcycleTypeInfo(type);
  const services = servicesForType(type);

  const submit = () =>
    start(async () => {
      if (!effectiveBrand) { toast.error(t("toast.enter-brand", lang)); return; }
      if (!effectiveModel) { toast.error(t("toast.enter-model", lang)); return; }
      const y = Number(year);
      if (y < 1990 || y > THIS_YEAR + 1) { toast.error(t("toast.valid-year", lang)); return; }
      const km = Math.max(0, Number(mileage) || 0);
      if (motorcycleId) {
        await updateMotorcycle({ motorcycleId, brand: effectiveBrand, model: effectiveModel, year: y, type, color, currentMileage: km });
        toast.success(t("toast.bike-updated", lang));
      } else if (customerId) {
        await addMotorcycle({ customerId, brand: effectiveBrand, model: effectiveModel, year: y, type, color, currentMileage: km });
        toast.success(t("toast.bike-added", lang));
      }
      onDone();
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* 左列：Brand + (Year | Color) */}
        <div className="space-y-3">
          <div>
            <Label>Brand</Label>
            <Select value={brandIsCustom && brand !== OTHERS ? OTHERS : brand} onValueChange={(v) => { setBrand(v ?? "Yamaha"); setModel(""); setCustomModel(""); }}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BIKE_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            {brandIsCustom && (
              <Input value={customBrand || (brand !== OTHERS ? brand : "")} onChange={(e) => setCustomBrand(e.target.value)} placeholder="Brand name" className="mt-1.5" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Year</Label>
              <Select value={year} onValueChange={(v) => setYear(v ?? String(THIS_YEAR - 1))}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* 右列：Model + Current Mileage */}
        <div className="space-y-3">
          <div>
            <Label>Model</Label>
            <Select value={modelIsCustom && model !== OTHERS ? OTHERS : model} onValueChange={(v) => { setModel(v ?? ""); setCustomModel(""); }}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {modelIsCustom && (
              <Input value={customModel || (model !== OTHERS ? model : "")} onChange={(e) => setCustomModel(e.target.value)} placeholder="Model name" className="mt-1.5" />
            )}
          </div>
          <div>
            <Label>Current Mileage (km)</Label>
            <Input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} className="mt-1.5" />
          </div>
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

      <Button className="w-full" size="lg" disabled={pending || !effectiveModel || !effectiveBrand} onClick={submit}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}