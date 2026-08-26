/** 业务周期窗口（+8 Asia/Kuala_Lumpur）：day / week（周一始）/ month → [start, end) UTC 边界。 */
export function periodWindow(period: "day" | "week" | "month", ref?: Date): { start: Date; end: Date } {
  const base = ref ?? new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(base).split("-").map(Number);
  const [y, m, d] = ymd as [number, number, number];
  const dayStartUtc = Date.UTC(y, m - 1, d) - 8 * 3600000; // +8 当日 00:00
  if (period === "day") return { start: new Date(dayStartUtc), end: new Date(dayStartUtc + 86400000) };
  if (period === "week") {
    const dow = new Date(dayStartUtc + 8 * 3600000).getUTCDay();
    const mondayOffset = (dow + 6) % 7;
    const start = new Date(dayStartUtc - mondayOffset * 86400000);
    return { start, end: new Date(start.getTime() + 7 * 86400000) };
  }
  return { start: new Date(Date.UTC(y, m - 1, 1) - 8 * 3600000), end: new Date(Date.UTC(y, m, 1) - 8 * 3600000) };
}
