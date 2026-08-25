import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/actions/reminders";

/**
 * Vercel Cron 入口：每日发送到期/逾期服务提醒（§生产功能启用）。
 * 鉴权：Vercel Cron 请求带 Authorization: Bearer $CRON_SECRET（vercel.json crons 配置）。
 * 手动验证：curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/reminders
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== "Bearer " + secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const result = await sendDueReminders();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
