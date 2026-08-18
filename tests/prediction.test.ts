import { describe, expect, it } from "vitest";
import { calculateNextServiceMileage, calculateNextServiceDate, calculateReorderPoint } from "@/lib/prediction";

describe("service prediction (§29, §71)", () => {
  it("31,800 + 3,000 = 34,800 km", () => {
    expect(calculateNextServiceMileage(31800)).toBe(34800);
  });
  it("18 Aug 2026 + 3,000 km ≈ November 2026", () => {
    const d = calculateNextServiceDate(new Date("2026-08-18T00:00:00Z"));
    expect(d.getUTCMonth()).toBe(10); // November
    expect(d.getUTCFullYear()).toBe(2026);
  });
});

describe("reorder (§37)", () => {
  it("reorder point = usage × lead + safety", () => {
    expect(calculateReorderPoint(2, 5, 5)).toBe(15);
  });
});
