import { describe, expect, it } from "vitest";
import { normalizePhone, phoneDigits, toE164, fmtStoredPhone, toE164ForWhatsApp } from "@/lib/phone";

describe("phone normalization (rider phone login)", () => {
  it("accepts local formats with separators", () => {
    expect(normalizePhone("013-125 2832")).toBe("0131252832");
    expect(normalizePhone("0131252832")).toBe("0131252832");
    expect(normalizePhone("013 125 2832")).toBe("0131252832");
  });
  it("accepts international +60 / 60 prefix", () => {
    expect(normalizePhone("+60131252832")).toBe("0131252832");
    expect(normalizePhone("60131252832")).toBe("0131252832");
  });
  it("rejects invalid phone numbers", () => {
    expect(normalizePhone("12345")).toBe("");
    expect(normalizePhone("abc")).toBe("");
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone("2131252832")).toBe(""); // 非 01x
  });
  it("normalizes stored values (digits) to local 10-digit", () => {
    expect(phoneDigits("013-125 2832")).toBe("0131252832");
    expect(phoneDigits("+60131252832")).toBe("0131252832");
    expect(phoneDigits(null)).toBe("");
    expect(phoneDigits(undefined)).toBe("");
  });
  it("converts local to E.164", () => {
    expect(toE164("0131252832")).toBe("+60131252832");
  });
  it("formats local to stored pattern", () => {
    expect(fmtStoredPhone("0131252832")).toBe("013-125 2832");
  });
});

describe("toE164ForWhatsApp (Meta WhatsApp requirement)", () => {
  it("converts stored local to E.164", () => {
    expect(toE164ForWhatsApp("013-125 2832")).toBe("+60131252832");
    expect(toE164ForWhatsApp("0131252832")).toBe("+60131252832");
    expect(toE164ForWhatsApp("013 125 2832")).toBe("+60131252832");
  });
  it("keeps already-E.164 and bare international", () => {
    expect(toE164ForWhatsApp("+60131252832")).toBe("+60131252832");
    expect(toE164ForWhatsApp("60131252832")).toBe("+60131252832");
  });
  it("fail-safe on empty/non-numeric", () => {
    expect(toE164ForWhatsApp("")).toBe("");
    expect(toE164ForWhatsApp(null)).toBe("");
    expect(toE164ForWhatsApp(undefined)).toBe("");
    expect(toE164ForWhatsApp("Ahmad Danial")).toBe("Ahmad Danial");
  });
});
