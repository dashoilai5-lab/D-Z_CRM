import "server-only";
import { randomBytes } from "node:crypto";

/** 生成 16 字符 URL-safe 随机 token（QR-001..003 扫码用，不可枚举）。 */
export function generateQrToken(): string {
  return randomBytes(12).toString("base64url").slice(0, 16);
}
