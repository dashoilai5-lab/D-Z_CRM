// 马来西亚手机号归一化工具（Rider 手机登录用）
// 存储格式（Customer.phone）：本地 "013-125 2832"；输入支持 0131252832 / 013-125 2832 / +60131252832 / 60131252832

/** 归一化用户输入 → 本地 10 位格式（01x-xxxxxxx 去分隔符）。无法识别返回 ""。 */
export function normalizePhone(input: string): string {
  const raw = input.trim().replace(/[^\d+]/g, "");
  if (!raw) return "";
  let d = raw.startsWith("+") ? raw.slice(1) : raw;
  // 国际前缀 60 → 本地 01x（+60131252832 → 60131252832 → 0131252832）
  if (d.startsWith("60") && d.length === 11) d = "0" + d.slice(2); // +60131252832 → 0131252832
  if (/^01\d{8}$/.test(d)) return d;
  return "";
}

/** 存储值 → 本地 10 位（"013-125 2832" → "0131252832"；"+60131252832" → "0131252832"）。 */
export function phoneDigits(phone: string | null | undefined): string {
  if (!phone) return "";
  let d = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (d.startsWith("60") && d.length === 11) d = "0" + d.slice(2);
  return d;
}

/** 本地 10 位 → E.164（0131252832 → +60131252832），供 Supabase phone 登录。 */
export function toE164(local: string): string {
  return "+60" + local.slice(1);
}
