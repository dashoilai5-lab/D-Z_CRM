import "server-only";

/**
 * 统一素材 URL：相对路径补全为绝对 URL。
 * - /api/storage/*（Supabase/local 存储路由）→ 原样返回（同源，浏览器自动用当前域名）
 * - /products/、/posters/ 等 public 静态资源 → 拼 NEXT_PUBLIC_BASE_URL（WhatsApp/外链场景）
 * - https:// 绝对 URL → 原样返回
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/api/")) return path; // API 路由（含 storage）保持同源
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3002";
  return base + (path.startsWith("/") ? path : "/" + path);
}
