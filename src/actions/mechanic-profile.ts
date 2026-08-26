"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";

/** Mechanic 编辑个人资料（Settings → Profile，authId 守卫只能改自己）。 */
export async function updateMechanicProfile(input: { name: string; phone?: string; email?: string }) {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) return { ok: false as const, error: "Not signed in as staff" };

  const name = input.name.trim();
  if (name.length < 2) return { ok: false as const, error: "Please enter your name." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
    },
  });
  revalidatePath("/mechanic-app", "layout");
  return { ok: true as const };
}
