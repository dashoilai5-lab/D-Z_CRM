// Promotions engine (§promo). Pure functions — unit-testable, deterministic.
// A PROMO campaign with an active window and a discountPercent yields a
// discounted price for a service package (or any priced item).

export interface PromoCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  discountPercent: number | null;
}

export interface PricedLine {
  description: string;
  priceSen: number;
}

export interface PromoQuote {
  campaignId: string;
  campaignName: string;
  discountPercent: number;
  originalSen: number;
  discountedSen: number;
  savedSen: number;
}

/** A campaign is currently applicable: PROMO type, ACTIVE status, within window. */
export function isPromoActive(c: PromoCampaign, now: Date = new Date()): boolean {
  if (c.type !== "PROMO" || c.status !== "ACTIVE") return false;
  if (!c.discountPercent || c.discountPercent < 1 || c.discountPercent > 100) return false;
  if (now < c.startDate) return false;
  if (c.endDate && now > c.endDate) return false;
  return true;
}

/** Clamp a percent into 1-100. */
export function clampPercent(p: number | null): number | null {
  if (p == null) return null;
  return Math.min(100, Math.max(1, Math.round(p)));
}

/**
 * Apply the best (highest-percent) active promo to a priced line.
 * Returns null when no active promo applies or the line is free.
 */
export function bestPromoQuote(lines: PricedLine[], campaigns: PromoCampaign[], now: Date = new Date()): PromoQuote | null {
  const active = campaigns
    .filter((c) => isPromoActive(c, now))
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  const best = active[0];
  if (!best) return null;
  const originalSen = lines.reduce((s, l) => s + l.priceSen, 0);
  if (originalSen <= 0) return null;
  const discountedSen = Math.round((originalSen * (100 - best.discountPercent!)) / 100);
  return {
    campaignId: best.id,
    campaignName: best.name,
    discountPercent: best.discountPercent!,
    originalSen,
    discountedSen,
    savedSen: originalSen - discountedSen,
  };
}

/** Human label for a campaign type. */
export const CAMPAIGN_TYPE_LABEL: Record<string, string> = {
  RETURN: "Return",
  REMINDER: "Reminder",
  PROMO: "Promo",
  NEWS: "News",
};
