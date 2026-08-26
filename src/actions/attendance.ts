"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";

/** 当天业务日（+8）的 UTC 零点。 */
function todayUtcStart(): Date {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(s + "T00:00:00Z");
}

/** Mechanic 打卡上班。 */
export async function checkIn() {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) return { ok: false as const, error: "Not signed in as staff" };
  const date = todayUtcStart();
  const att = await db.attendance.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, checkInAt: new Date() },
    update: { checkInAt: new Date() },
  });
  revalidatePath("/workshop/attendance");
  revalidatePath("/workshop", "layout");
  return { ok: true as const, checkInAt: att.checkInAt };
}

/** Mechanic 打卡下班。 */
export async function checkOut() {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) return { ok: false as const, error: "Not signed in as staff" };
  const date = todayUtcStart();
  const att = await db.attendance.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, checkInAt: new Date(), checkOutAt: new Date() },
    update: { checkOutAt: new Date() },
  });
  revalidatePath("/workshop/attendance");
  revalidatePath("/workshop", "layout");
  return { ok: true as const, checkOutAt: att.checkOutAt };
}
