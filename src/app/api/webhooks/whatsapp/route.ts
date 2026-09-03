import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Meta WhatsApp Business Cloud API 投递回执 webhook（Messaging → 换真 的配套）。
 *
 * Meta Developers → WhatsApp → Configuration 配置：
 *   Callback URL = https://<domain>/api/webhooks/whatsapp
 *   Verify token = $WHATSAPP_VERIFY_TOKEN
 * 收到 statuses（sent/delivered/read/failed）后，按 Message.externalId 更新 Message.status。
 * 未配置 WHATSAPP_VERIFY_TOKEN 时 fail-safe：GET 403（无法验签）、POST ack 200 但不落库。
 * 可选：配置 WHATSAPP_APP_SECRET 后按 X-Hub-Signature-256（HMAC-SHA256）严格验签。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, "SENT" | "DELIVERED" | "READ" | "FAILED"> = {
  sent: "SENT",
  delivered: "DELIVERED",
  read: "READ",
  failed: "FAILED",
  error: "FAILED",
};

export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token) return new NextResponse("verify token not configured", { status: 403 });
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const verifyToken = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && verifyToken === token && challenge) {
    return new NextResponse(challenge);
  }
  return new NextResponse("verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token) return NextResponse.json({ ok: true }); // fail-safe ack，不落地
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (process.env.WHATSAPP_APP_SECRET && signature) {
    const crypto = (await import("crypto")).default;
    const expected =
      "sha256=" + crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET).update(raw).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ ok: false, error: "bad signature" }, { status: 401 });
    }
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  type StatusRow = { id?: string; status?: string };
  type WaChange = { value?: { statuses?: StatusRow[] } };
  const entries = (payload as { entry?: { changes?: WaChange[] }[] }).entry ?? [];
  let updated = 0;
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const st of change.value?.statuses ?? []) {
        const id = st.id;
        const mapped = STATUS_MAP[st.status ?? ""];
        if (id && mapped) {
          const res = await db.message.updateMany({ where: { externalId: id }, data: { status: mapped } });
          updated += res.count;
        }
      }
    }
  }
  return NextResponse.json({ ok: true, updated });
}
