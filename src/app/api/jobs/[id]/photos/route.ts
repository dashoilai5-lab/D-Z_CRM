import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storageProvider } from "@/providers";
import { getSessionUser } from "@/lib/session-user";

export const dynamic = "force-dynamic";

type JobPhotoAngle = "FRONT" | "BACK" | "LEFT" | "RIGHT" | "METER";
const ANGLES: JobPhotoAngle[] = ["FRONT", "BACK", "LEFT", "RIGHT", "METER"];

/** Pre-service SOP photo upload (SOP-001): mechanic captures 5 condition photos before starting a job. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const angleRaw = String(form.get("angle") ?? "").toUpperCase();
  if (!ANGLES.includes(angleRaw as JobPhotoAngle)) return NextResponse.json({ ok: false, error: "Invalid angle" }, { status: 400 });
  if (!file) return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "Image required" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: "File too large (max 8MB)" }, { status: 400 });

  const job = await db.serviceJob.findUnique({ where: { id }, select: { id: true, mechanicId: true, status: true } });
  if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  if (job.mechanicId !== session.user.id) return NextResponse.json({ ok: false, error: "Not your job" }, { status: 403 });
  if (job.status !== "WAITING") return NextResponse.json({ ok: false, error: "Only before service starts" }, { status: 400 });

  const angle = angleRaw as JobPhotoAngle;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = ((file.name.split(".").pop() ?? "jpg").replace(/[^a-z0-9]/gi, "") || "jpg").toLowerCase();
  const key = "job-photos/" + id + "/" + angle.toLowerCase() + "-" + Date.now() + "." + ext;
  const url = await storageProvider.put(key, bytes, file.type);
  await db.serviceJobPhoto.upsert({
    where: { jobId_angle: { jobId: id, angle } },
    create: { jobId: id, angle, photoUrl: url, capturedById: session.user.id },
    update: { photoUrl: url, capturedById: session.user.id, capturedAt: new Date() },
  });
  return NextResponse.json({ ok: true, url });
}
