/**
 * 把本地 ./storage 目录同步到生产 Supabase Storage bucket（dz-assets）。
 * 用途：本地开发生成的海报/上传附件，一键推送到生产存储，避免生产图片 404。
 * 幂等：upsert 上传，重复执行安全。
 * 用法：pnpm exec tsx scripts/sync-storage-to-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

// 加载 .env（Node 20.12+ 内置，无需 dotenv）
try { process.loadEnvFile(path.join(process.cwd(), ".env")); } catch {}

function mimeOf(f: string): string {
  if (f.endsWith(".svg")) return "image/svg+xml";
  if (f.endsWith(".png")) return "image/png";
  if (f.endsWith(".jpg") || f.endsWith(".jpeg")) return "image/jpeg";
  if (f.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.STORAGE_BUCKET ?? "dz-assets";
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const dir = path.join(process.cwd(), "storage");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  console.log("local storage files:", files.length);
  let ok = 0, fail = 0;
  for (const f of files) {
    const data = fs.readFileSync(path.join(dir, f));
    const { error } = await sb.storage.from(bucket).upload(f, data, { contentType: mimeOf(f), upsert: true });
    if (error) { console.error("FAIL", f, error.message); fail++; } else { ok++; }
  }
  console.log("uploaded:", ok, "failed:", fail);
  const { data } = await sb.storage.from(bucket).list("", { limit: 200 });
  console.log("bucket now:", data ? data.length : 0, "files");
}

main().catch((e) => { console.error(e); process.exit(1); });
