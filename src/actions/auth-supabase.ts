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

/**
 * Rider 顾客自助注册：建 Supabase auth 用户 + 自动创建 Customer 记录并绑定 authId + 注入 claims。
 * 新顾客挂到默认组织（首个 Organisation），branchId 留空（workshop 员工后续分配）。
 */
export async function signUpRider(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false as const, error: "Please enter your name." };
  if (input.password.length < 8) return { ok: false as const, error: "Password must be at least 8 characters." };

  // 测试域 / 开发环境：admin API 直建 + 自动确认（免 signUp 邮件限流、免点确认邮件）
  const isTestEmail = /@dz\.my$/.test(email) || email.startsWith("test.") || email.startsWith("dztest") || email.startsWith("autoconf");
  const wantAutoConfirm = process.env.NODE_ENV !== "production" || isTestEmail;

  // 1. 建 auth 用户
  let authUserId: string | undefined;
  let autoSession = false;
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (wantAutoConfirm) {
    const { data: ad, error: aErr } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (aErr) {
      if (/already registered|already been registered|email.*exist/i.test(aErr.message)) {
        return { ok: false as const, error: "An account with this email already exists — try signing in." };
      }
      return { ok: false as const, error: aErr.message };
    }
    authUserId = ad.user.id;
    autoSession = true;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: { data: { name } },
    });
    if (error) return { ok: false as const, error: error.message };
    authUserId = data.user?.id;
    autoSession = !!data.session;
    if (!authUserId) return { ok: false as const, error: "Sign-up failed — try again." };
  }

  // 2. 自动创建 Customer 并绑定 authId（幂等：同 email 已有则跳过创建只绑 authId）
  try {
    let customer = await db.customer.findFirst({ where: { email } });
    if (!customer) {
      const org = await db.organisation.findFirst({ orderBy: { name: "asc" } });
      if (!org) return { ok: false as const, error: "No workshop organisation configured." };
      customer = await db.customer.create({
        data: { organisationId: org.id, name, email, authId: authUserId },
      });
    } else if (!customer.authId) {
      customer = await db.customer.update({ where: { id: customer.id }, data: { authId: authUserId } });
    }

    // 3. 注入 CUSTOMER claims（RLS 用）
    const claims: BizClaims = {
      orgId: customer.organisationId,
      branchId: customer.branchId ?? "",
      role: "CUSTOMER",
      userId: "",
      customerId: customer.id,
    };
    const { error: metaErr } = await admin.auth.admin.updateUserById(authUserId, { user_metadata: claims });
    if (metaErr) return { ok: false as const, error: "Account created but linking failed: " + metaErr.message };
  } catch (e) {
    return { ok: false as const, error: "Account created but profile setup failed: " + String((e as Error).message).slice(0, 120) };
  }

  // 测试域：admin 建号无客户端 session——自动登录（密码登录建立 cookie session）
  if (autoSession) {
    const supabase = await createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: input.password });
    if (signInErr) return { ok: true as const, emailConfirm: false, signInFailed: signInErr.message };
  }

  // 测试域已自动确认（前端直接跳转）；非测试域（email confirm 开启）提示查邮件
  return { ok: true as const, emailConfirm: !autoSession };
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