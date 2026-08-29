"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSalaryRules } from "@/actions/settlements";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import type { SalaryRules } from "@/modules/staff/service";

/** 薪资规则配置表单（OWNER，折叠区）。 */
export function SalaryRulesForm({ rules }: { rules: SalaryRules }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [type, setType] = useState<SalaryRules["commissionType"]>(rules.commissionType);
  const [value, setValue] = useState(String(rules.commissionValue));
  const [addon, setAddon] = useState(String((rules.addonBonusSen ?? 0) / 100));

  const save = () =>
    start(async () => {
      const r = await updateSalaryRules({
        baseSen: 0,
        commissionType: type,
        commissionValue: type === "percent_sales" ? parseFloat(value || "0") : Math.round(parseFloat(value || "0") * 100),
        addonBonusSen: Math.round(parseFloat(addon || "0") * 100),
      });
      if (r.ok) { toast.success(t("settle.rules-saved", lang)); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("settle.rules-hint", lang)}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("settle.addon-bonus", lang)}</Label>
          <Input inputMode="decimal" value={addon} onChange={(e) => setAddon(e.target.value)} className="mt-1.5" placeholder="0" />
        </div>
        <div />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("settle.commission-type", lang)}</Label>
          <select value={type} onChange={(e) => setType(e.target.value as SalaryRules["commissionType"])} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="per_job">{t("settle.comm-per-job", lang)}</option>
            <option value="percent_sales">{t("settle.comm-percent", lang)}</option>
            <option value="flat">{t("settle.comm-flat", lang)}</option>
          </select>
        </div>
        <div>
          <Label>{type === "percent_sales" ? t("settle.commission-value", lang) + " (%)" : t("settle.commission-value", lang) + " (RM)"}</Label>
          <Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1.5" placeholder="0" />
        </div>
      </div>
      <Button className="w-full" disabled={pending} onClick={save}>{pending ? t("common.loading", lang) : t("settle.save-rules", lang)}</Button>
    </div>
  );
}
