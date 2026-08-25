import "server-only";

/**
 * 统一素材 URL：相对路径（/products/…、/posters/…）补全为绝对 URL。
 * - 生产：NEXT_PUBLIC_BASE_URL（正式域名）→ 海报/产品图可被 WhatsApp/外链正确加载
 * - Supabase Storage 绝对 URL（https://…）原样返回
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3002";
  return base + (path.startsWith("/") ? path : "/" + path);
}
