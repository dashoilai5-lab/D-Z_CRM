import { describe, it, expect } from "vitest";
import { isPromoActive, bestPromoQuote, clampPercent } from "@/modules/marketing/promo";

const now = new Date("2026-08-19T10:00:00Z");
const base = (over: Partial<{ id: string; name: string; type: string; status: string; startDate: Date; endDate: Date | null; discountPercent: number | null }>) => ({
  id: "c1", name: "Test Promo", type: "PROMO", status: "ACTIVE",
  startDate: new Date("2026-08-01"), endDate: new Date("2026-08-31"), discountPercent: 20,
  ...over,
});

describe("promotions engine", () => {
  it("isPromoActive: active PROMO within window applies", () => {
    expect(isPromoActive(base({}), now)).toBe(true);
  });

  it("isPromoActive: non-PROMO / non-ACTIVE / outside window rejected", () => {
    expect(isPromoActive(base({ type: "NEWS" }), now)).toBe(false);
    expect(isPromoActive(base({ status: "DRAFT" }), now)).toBe(false);
    expect(isPromoActive(base({ startDate: new Date("2026-09-01") }), now)).toBe(false);
    expect(isPromoActive(base({ endDate: new Date("2026-08-10") }), now)).toBe(false);
    expect(isPromoActive(base({ discountPercent: null }), now)).toBe(false);
    expect(isPromoActive(base({ discountPercent: 0 }), now)).toBe(false);
    expect(isPromoActive(base({ discountPercent: 101 }), now)).toBe(false);
  });

  it("bestPromoQuote: applies highest percent to the line total", () => {
    const quote = bestPromoQuote(
      [{ description: "Standard Service", priceSen: 12000 }, { description: "Oil Filter", priceSen: 2500 }],
      [base({ id: "a", discountPercent: 15 }), base({ id: "b", discountPercent: 20 })],
      now
    );
    expect(quote?.campaignId).toBe("b");
    expect(quote?.originalSen).toBe(14500);
    expect(quote?.discountedSen).toBe(11600); // 20% off
    expect(quote?.savedSen).toBe(2900);
  });

  it("bestPromoQuote: null when no active promo or zero total", () => {
    expect(bestPromoQuote([{ description: "x", priceSen: 1000 }], [base({ status: "ENDED" })], now)).toBeNull();
    expect(bestPromoQuote([{ description: "x", priceSen: 0 }], [base({})], now)).toBeNull();
  });

  it("clampPercent bounds to 1-100", () => {
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(0)).toBe(1);
    expect(clampPercent(33.4)).toBe(33);
    expect(clampPercent(null)).toBeNull();
  });
});
