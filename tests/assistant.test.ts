import { describe, expect, it } from "vitest";
import { detectIntent } from "@/modules/assistant/router";
import { buildSystemPrompt } from "@/modules/assistant/prompt";

describe("assistant detectIntent (multilingual)", () => {
  it("routes revenue-today (zh/en/ms)", () => {
    expect(detectIntent("今天收入有多少？").kind).toBe("revenue_today");
    expect(detectIntent("How much revenue today?").kind).toBe("revenue_today");
    expect(detectIntent("berapa pendapatan hari ini?").kind).toBe("revenue_today");
  });

  it("routes booking-today (zh/en/ms)", () => {
    expect(detectIntent("今天有多少个预约？").kind).toBe("booking_today");
    expect(detectIntent("how many bookings today?").kind).toBe("booking_today");
    expect(detectIntent("berapa tempahan hari ini?").kind).toBe("booking_today");
  });

  it("routes customers count", () => {
    expect(detectIntent("总共有多少客户？").kind).toBe("customers_count");
    expect(detectIntent("how many customers do we have").kind).toBe("customers_count");
  });

  it("routes jobs-overview on today", () => {
    expect(detectIntent("今天有几张工单？").kind).toBe("jobs_overview");
  });

  it("routes stock alerts", () => {
    expect(detectIntent("库存有告警吗").kind).toBe("stock_alerts");
    expect(detectIntent("low stock reorder").kind).toBe("stock_alerts");
  });

  it("routes reminders due", () => {
    expect(detectIntent("有哪些逾期提醒？").kind).toBe("reminders_due");
    expect(detectIntent("due service reminders").kind).toBe("reminders_due");
  });

  it("routes how-to guides", () => {
    expect(detectIntent("如何创建账单？")).toEqual({ kind: "guide", guide: "invoice" });
    expect(detectIntent("how do i create an invoice")).toEqual({ kind: "guide", guide: "invoice" });
    expect(detectIntent("how do I check in a booking")).toEqual({ kind: "guide", guide: "checkin" });
    expect(detectIntent("如何创建工单")).toEqual({ kind: "guide", guide: "create-job" });
  });

  it("routes check-ins count (was wrongly a how-to)", () => {
    expect(detectIntent("how many check in").kind).toBe("check_ins");
    expect(detectIntent("今天进店多少个？").kind).toBe("check_ins");
  });

  it("routes parts count", () => {
    expect(detectIntent("how many total parts i have").kind).toBe("parts_count");
    expect(detectIntent("总共有多少配件？").kind).toBe("parts_count");
  });

  it("routes month earnings", () => {
    expect(detectIntent("whats my current earnings of this month").kind).toBe("month_earnings");
    expect(detectIntent("本月收入多少？").kind).toBe("month_earnings");
  });

  it("routes dead stock value", () => {
    expect(detectIntent("whats my dead stock value").kind).toBe("dead_stock_value");
    expect(detectIntent("滞销库存价值多少？").kind).toBe("dead_stock_value");
  });

  it("routes overdue customers", () => {
    expect(detectIntent("how many customers are overdue for service").kind).toBe("overdue_customers");
    expect(detectIntent("有多少客户逾期未保养？").kind).toBe("overdue_customers");
  });

  it("routes average rating", () => {
    expect(detectIntent("whats my average rating now").kind).toBe("average_rating");
    expect(detectIntent("我的平均评分是多少？").kind).toBe("average_rating");
  });

  it("routes analytics queries", () => {
    expect(detectIntent("brand analysis").kind).toBe("analytics_brand");
    expect(detectIntent("哪个品牌最受欢迎").kind).toBe("analytics_brand");
    expect(detectIntent("monthly service trend").kind).toBe("analytics_monthly_services");
    expect(detectIntent("每月服务量趋势").kind).toBe("analytics_monthly_services");
    expect(detectIntent("whats my revenue trend").kind).toBe("analytics_revenue");
    expect(detectIntent("repeat customers analysis").kind).toBe("analytics_customers");
    expect(detectIntent("whats my repeat customer rate").kind).toBe("analytics_customers");
    expect(detectIntent("top salesperson").kind).toBe("analytics_sales");
    expect(detectIntent("inventory analytics").kind).toBe("analytics_inventory");
    expect(detectIntent("show me the analytics").kind).toBe("analytics_overview");
    expect(detectIntent("最常用的服务是什么").kind).toBe("analytics_service");
  });

  it("falls back to general", () => {
    expect(detectIntent("你好").kind).toBe("general");
    expect(detectIntent("what is the meaning of life").kind).toBe("general");
  });
});

describe("assistant buildSystemPrompt", () => {
  it("targets the active language", () => {
    expect(buildSystemPrompt("zh")).toContain("Reply ONLY in 中文");
    expect(buildSystemPrompt("ms")).toContain("Reply ONLY in Bahasa Malaysia");
    expect(buildSystemPrompt("en")).toContain("Reply ONLY in English");
  });

  it("forbids inventing numbers and secrets", () => {
    const p = buildSystemPrompt("en");
    expect(p).toContain("NEVER invent");
    expect(p).toContain("secrets");
  });
});
