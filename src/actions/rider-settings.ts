"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getRiderCustomer } from "@/lib/rider-customer";
import { createClient } from "@/lib/supabase/server";
import { parsePrefs, type NotificationPrefs } from "@/lib/rider-prefs";

/**
 * 更新当前 rider 的通知偏好（authId 守卫，只能改自己）。
 */
export async function updateRiderNotificationPrefs(input: Partial<NotificationPrefs>) {
  const customer = await getRiderCustomer();
  if (!customer) return { ok: false as const, error: "Not signed in" };

  const next = { ...parsePrefs(customer.notificationPrefs), ...input };
  await db.customer.update({
    where: { id: customer.id },
    data: { notificationPrefs: next },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/**
 * 更换密码（Settings → Security）：先用当前密码校验身份，再更新 Supabase 密码。
 * 改密后当前 session 保持，其他设备 session 失效（Supabase 行为）。
 */
export async function changeRiderPassword(input: { currentPassword: string; newPassword: string }) {
  const customer = await getRiderCustomer();
  if (!customer) return { ok: false as const, error: "Not signed in" };
  if (!customer.email) return { ok: false as const, error: "No email on file — contact the workshop." };

  const newPassword = input.newPassword;
  if (newPassword.length < 8) return { ok: false as const, error: "New password must be at least 8 characters." };

  const supabase = await createClient();
  // 校验当前密码（signInWithPassword 也会刷新当前 session）
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: customer.email,
    password: input.currentPassword,
  });
  if (verifyErr) return { ok: false as const, error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
