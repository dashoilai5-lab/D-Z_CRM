"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/** 业务身份（JWT claims）——A2 RLS 读取 request.jwt.claims 依赖这些字段。 */
export interface BizClaims {
  orgId: string;
  branchId: string;
  role: string;
  userId: string;
  customerId: string;
}

/** 登录后把业务身份写入 Supabase user_metadata（进 JWT claims）。 */
export async function injectBizClaims(authUserId: string) {
  const supabase = await createClient();
  // 先查员工，再查顾客（rider）
  const staff = await db.user.findUnique({ where: { authId: authUserId } });
  if (staff) {
    const claims: BizClaims = {
      orgId: staff.organisationId,
      branchId: staff.branchId ?? "",
      role: staff.role,
      userId: staff.id,
      customerId: "",
    };
    const { error } = await supabase.auth.updateUser({ data: claims });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, claims };
  }
  const rider = await db.customer.findUnique({ where: { authId: authUserId } });
  if (rider) {
    const claims: BizClaims = {
      orgId: rider.organisationId,
      branchId: rider.branchId ?? "",
      role: "CUSTOMER",
      userId: "",
      customerId: rider.id,
    };
    const { error } = await supabase.auth.updateUser({ data: claims });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, claims };
  }
  // auth 用户尚未关联业务账号——管理员需先绑定（A3.7 建测试用户时做）
  return { ok: false as const, error: "No D&Z account linked to this auth user." };
}

export async function signInWithPassword(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false as const, error: error.message };
  if (!data.user) return { ok: false as const, error: "No user returned." };
  // 关联业务身份 → 注入 claims
  const linked = await injectBizClaims(data.user.id);
  if (!linked.ok) return { ok: false as const, error: linked.error };
  return { ok: true as const };
}

export async function signInWithOtp(input: { email: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: input.email });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function verifyOtp(input: { email: string; token: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email: input.email, token: input.token, type: "email" });
  if (error) return { ok: false as const, error: error.message };
  if (!data.user) return { ok: false as const, error: "No user returned." };
  const linked = await injectBizClaims(data.user.id);
  if (!linked.ok) return { ok: false as const, error: linked.error };
  return { ok: true as const };
}

export async function signOutSupabase() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** 当前 Supabase 用户（middleware 已刷新 session）。 */
export async function getSupabaseUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
