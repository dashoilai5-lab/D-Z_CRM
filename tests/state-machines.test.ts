import { describe, expect, it } from "vitest";
import { canTransitionJob, canTransitionBooking, stockLevel, calculateKpiScore } from "@/lib/state-machines";

describe("job state machine (§21)", () => {
  it("allows legal transitions", () => {
    expect(canTransitionJob("WAITING", "IN_PROGRESS")).toBe(true);
    expect(canTransitionJob("IN_PROGRESS", "AWAITING_APPROVAL")).toBe(true);
    expect(canTransitionJob("AWAITING_APPROVAL", "IN_PROGRESS")).toBe(true);
    expect(canTransitionJob("READY", "COMPLETED")).toBe(true);
  });
  it("rejects illegal transitions", () => {
    expect(canTransitionJob("WAITING", "COMPLETED")).toBe(false);
    expect(canTransitionJob("COMPLETED", "READY")).toBe(false);
    expect(canTransitionJob("CANCELLED", "IN_PROGRESS")).toBe(false);
  });
});

describe("booking state machine (§20)", () => {
  it("allows confirm → check-in → complete", () => {
    expect(canTransitionBooking("REQUESTED", "CONFIRMED")).toBe(true);
    expect(canTransitionBooking("CONFIRMED", "CHECKED_IN")).toBe(true);
    expect(canTransitionBooking("CHECKED_IN", "COMPLETED")).toBe(true);
  });
  it("rejects skipping steps", () => {
    expect(canTransitionBooking("REQUESTED", "CHECKED_IN")).toBe(false);
    expect(canTransitionBooking("CONFIRMED", "COMPLETED")).toBe(false);
  });
});

describe("stock level (§35)", () => {
  it("classifies levels", () => {
    expect(stockLevel(0, 10)).toBe("OUT_OF_STOCK");
    expect(stockLevel(3, 10)).toBe("CRITICAL");
    expect(stockLevel(8, 10)).toBe("LOW");
    expect(stockLevel(25, 10)).toBe("HEALTHY");
  });
});

describe("KPI score (§33)", () => {
  it("computes an explainable 0-100 score", () => {
    const score = calculateKpiScore({ jobs: 18, avgTicketSen: 15000, packageConversion: 90, addonConversion: 60, checklistCompletion: 100, rating: 4.8 });
    // 0.3×100 + 0.2×100 + 0.15×90 + 0.15×60 + 0.1×100 + 0.1×96 = 92.1 → 92
    expect(score).toBe(92);
  });
  it("never exceeds 100", () => {
    expect(calculateKpiScore({ jobs: 99, avgTicketSen: 999999, packageConversion: 100, addonConversion: 100, checklistCompletion: 100, rating: 5 })).toBe(100);
  });
});
