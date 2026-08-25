"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getRiderCustomer } from "@/lib/rider-customer";

/**
 * Rider 编辑个人资料（Settings → Profile）。
 * 仅允许更新自己的记录（基于 Supabase authId 取当前顾客）。
 */
export async function updateRiderProfile(input: {
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  address?: string;
}) {
  const customer = await getRiderCustomer();
  if (!customer) return { ok: false as const, error: "Not signed in" };

  const name = input.name.trim();
  if (name.length < 2) return { ok: false as const, error: "Please enter your name." };
  const email = input.email?.trim().toLowerCase() || null;

  await db.customer.update({
    where: { id: customer.id },
    data: {
      name,
      phone: input.phone?.trim() || null,
      email,
      gender: input.gender?.trim() || null,
      address: input.address?.trim() || null,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
