import { NextRequest, NextResponse } from "next/server";
import { storageProvider } from "@/providers";

/** Serve stored files (posters / attachments) from the storage provider. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const raw = key.join("/");
  const data = await storageProvider.get(raw);
  if (!data) return new NextResponse("Not found", { status: 404 });
  const name = raw.split("/").pop() ?? "file";
  const mime = name.endsWith(".svg") ? "image/svg+xml" : name.endsWith(".png") ? "image/png" : name.endsWith(".jpg") || name.endsWith(".jpeg") ? "image/jpeg" : name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
  return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" } });
}
