import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePoster } from "@/modules/marketing/poster-gen";

/** AI poster generation: requirements → branded SVG poster → storage + library. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  try {
    const { asset, url } = await generatePoster({
      branchId: branch!.id,
      title,
      subtitle: body.subtitle ? String(body.subtitle) : undefined,
      promo: body.promo ? String(body.promo) : undefined,
      tone: body.tone ?? "brand",
      size: body.size ?? "SQUARE",
      assetUrl: body.assetUrl ? String(body.assetUrl) : undefined,
    });
    return NextResponse.json({ ok: true, id: asset.id, url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message).slice(0, 200) }, { status: 500 });
  }
}
