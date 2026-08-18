import { describe, expect, it } from "vitest";
import { toSen, formatRM, grossProfit, grossMargin } from "@/lib/money";

describe("money (§102)", () => {
  it("converts RM to sen without float error", () => {
    expect(toSen(165)).toBe(16500);
    expect(toSen(120)).toBe(12000);
    expect(toSen(0.2)).toBe(20);
  });
  it("formats whole RM without decimals", () => {
    expect(formatRM(16500)).toBe("RM165");
    expect(formatRM(485000)).toBe("RM4,850");
  });
  it("formats cents with two decimals", () => {
    expect(formatRM(16550)).toBe("RM165.50");
  });
});

describe("profit (§38, §69)", () => {
  it("revenue 165 − COGS 72 = gross profit 93", () => {
    expect(grossProfit(16500, 7200)).toBe(9300);
  });
  it("margin = GP / revenue × 100", () => {
    expect(grossMargin(9300, 16500)).toBeCloseTo(56.36, 1);
  });
});
