import { t, tpl, type Lang } from "@/lib/i18n";

// Inventory reason / recommendation strings are generated in modules/inventory/service.ts as
// English sentences and rendered as data. Map them to i18n keys so they follow the active language.
const REASON_KEYS: Record<string, string> = {
  "Out of stock": "inv.reason.out_of_stock",
  "Below half of minimum stock": "inv.reason.below_half_min",
  "Below minimum stock": "inv.reason.below_min",
};
const REC_KEYS: Record<string, string> = {
  "Bundle with service package or discount heavily": "inv.rec.bundle",
  "Create promotion or transfer to another branch": "inv.rec.promote",
  "Watch — consider bundling": "inv.rec.watch",
};

/** Translate a stockStatus reason sentence; the dynamic "run out within N days" builds via tpl. */
export function invReason(s: string, lang: Lang): string {
  const key = REASON_KEYS[s];
  if (key) return t(key, lang);
  const m = s.match(/^Estimated to run out within (\d+) days$/);
  if (m) return tpl("inv.reason.run_out_days", lang, { n: Number(m[1]) });
  return s;
}

/** Translate a dead-stock recommendation sentence. */
export function invRecommendation(s: string, lang: Lang): string {
  return REC_KEYS[s] ? t(REC_KEYS[s], lang) : s;
}
