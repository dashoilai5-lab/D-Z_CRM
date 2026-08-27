"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { generateQrToken } from "@/lib/qr-token";
import { normalizePhone, phoneDigits, toE164, fmtStoredPhone } from "@/lib/phone";
import type { Customer } from "@prisma/client";

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

/** Service-role admin client（建号/查号/注入 claims 用，server-only）。 */
async function createAdminClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** 手机号 → Customer.phone（归一化匹配）→ authId。 */
async function customerByPhone(local: string): Promise<(Pick<Customer, "id" | "phone" | "authId" | "organisationId" | "branchId" | "gender"> & { email: string | null }) | null> {
  const candidates = await db.customer.findMany({ where: { phone: { not: null } }, select: { id: true, phone: true, authId: true, email: true, organisationId: true, branchId: true, gender: true } });
  return candidates.find((c) => phoneDigits(c.phone) === local) ?? null;
}

/**
 * 登录：email（workshop/rider）或手机号（rider，identifier 二选一）。
 * - email：直接 signInWithPassword
 * - 手机号：Customer.phone → authId → auth email（兼容现有 email 账号）；phone-only 用户走 Supabase phone
 */
export async function signInWithPassword(input: { email?: string; identifier?: string; password: string }) {
  const supabase = await createClient();
  let email = input.email;
  let phone: string | undefined;

  const id = (input.identifier ?? "").trim();
  if (id) {
    if (id.includes("@")) {
      email = id.toLowerCase();
    } else {
      const local = normalizePhone(id);
      if (!local) return { ok: false as const, error: "Invalid phone number — use e.g. 012-345 6789." };
      const cust = await customerByPhone(local);
      if (!cust) return { ok: false as const, error: "No account found with this phone number — try signing up." };
      if (!cust.authId) return { ok: false as const, error: "No D&Z account linked to this phone." };
      const admin = await createAdminClient();
      const { data: au, error: auErr } = await admin.auth.admin.getUserById(cust.authId);
      if (auErr || !au.user) return { ok: false as const, error: "Could not resolve account — contact the workshop." };
      if (au.user.email) email = au.user.email;
      else phone = toE164(local); // phone-only 用户（需 Supabase Phone provider 开启）
    }
  }

  const { data, error } = email
    ? await supabase.auth.signInWithPassword({ email, password: input.password })
    : await supabase.auth.signInWithPassword({ phone: phone!, password: input.password });
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
 * Rider 顾客自助注册：邮箱或手机号二选一。
 * - email：现有逻辑（测试域自动确认 + 自动登录）
 * - 手机号：归一化匹配老客 Customer.phone → 绑定 authId（老客注册）；无老客则新建 Customer。
 *   auth 用户：老客有 email 用 email 创建；否则 phone-only（createUser({phone})，登录需 Supabase Phone provider 开启）。
 */
export async function signUpRider(input: { name: string; email?: string; identifier?: string; gender?: string; password: string }) {
  const name = input.name.trim();
  const gender = input.gender === "M" || input.gender === "F" ? input.gender : null;
  if (name.length < 2) return { ok: false as const, error: "Please enter your name." };
  if (input.password.length < 8) return { ok: false as const, error: "Password must be at least 8 characters." };

  // 归一化 identifier：邮箱或手机号（二选一）
  const id = (input.identifier ?? input.email ?? "").trim();
  let email: string | undefined = id.includes("@") ? id.toLowerCase() : undefined;
  let phoneLocal: string | undefined;
  if (!email && id) {
    phoneLocal = normalizePhone(id);
    if (!phoneLocal) return { ok: false as const, error: "Invalid phone number — use e.g. 012-345 6789." };
  }
  if (!email && !phoneLocal) return { ok: false as const, error: "Enter your email or phone number." };

  const admin = await createAdminClient();

  // 老客匹配：手机号 → Customer.phone（老客注册，绑定 authId）
  let existing = phoneLocal ? await customerByPhone(phoneLocal) : null;
  // 老客有 email 且本次未填 → 用老客 email 建 auth（保持双通道同一账号）
  if (phoneLocal && !email && existing?.email) email = existing.email;
  // 重复检测
  if (email) {
    const dup = await db.customer.findFirst({ where: { email } });
    if (dup?.authId) return { ok: false as const, error: "An account with this email already exists — try signing in." };
  } else if (existing?.authId) {
    return { ok: false as const, error: "An account with this phone already exists — try signing in." };
  }

  // 测试域 / 开发环境：admin API 直建 + 自动确认（免 signUp 邮件限流、免点确认邮件）；phone 注册一律自动确认
  const isTestEmail = email ? /@dz\.my$/.test(email) || email.startsWith("test.") || email.startsWith("dztest") || email.startsWith("autoconf") : false;
  const wantAutoConfirm = process.env.NODE_ENV !== "production" || isTestEmail || !email;
  const phoneE164 = phoneLocal ? toE164(phoneLocal) : undefined;

  // 1. 建 auth 用户
  let authUserId: string | undefined;
  let autoSession = false;

  if (wantAutoConfirm) {
    const { data: ad, error: aErr } = email
      ? await admin.auth.admin.createUser({ email, password: input.password, email_confirm: true, user_metadata: { name } })
      : await admin.auth.admin.createUser({ phone: phoneE164, password: input.password, phone_confirm: true, user_metadata: { name } });
    if (aErr) {
      if (/already registered|already been registered|email.*exist|phone.*exist|phone number.*exist/i.test(aErr.message)) {
        return { ok: false as const, error: "An account with this " + (email ? "email" : "phone") + " already exists — try signing in." };
      }
      return { ok: false as const, error: aErr.message };
    }
    authUserId = ad.user.id;
    autoSession = true;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email!,
      password: input.password,
      options: { data: { name } },
    });
    if (error) return { ok: false as const, error: error.message };
    authUserId = data.user?.id;
    autoSession = !!data.session;
    if (!authUserId) return { ok: false as const, error: "Sign-up failed — try again." };
  }

  // 2. 绑定 Customer：老客（phone/email 匹配）→ 绑 authId；新客 → 创建
  try {
    let customer = existing ?? (email ? await db.customer.findFirst({ where: { email } }) : null);
    if (!customer) {
      const org = await db.organisation.findFirst({ orderBy: { name: "asc" } });
      if (!org) return { ok: false as const, error: "No workshop organisation configured." };
      customer = await db.customer.create({
        data: { organisationId: org.id, name, email: email ?? null, phone: phoneLocal ? fmtStoredPhone(phoneLocal) : undefined, gender, authId: authUserId, qrToken: generateQrToken() },
      });
    } else if (!customer.authId) {
      customer = await db.customer.update({
        where: { id: customer.id },
        data: { authId: authUserId, ...(phoneLocal && !customer.phone ? { phone: fmtStoredPhone(phoneLocal) } : {}), ...(gender && !customer.gender ? { gender } : {}) },
      });
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

  // admin 建号无客户端 session——自动登录（密码登录建立 cookie session）
  if (autoSession) {
    const supabase = await createClient();
    const { error: signInErr } = email
      ? await supabase.auth.signInWithPassword({ email, password: input.password })
      : await supabase.auth.signInWithPassword({ phone: phoneE164!, password: input.password });
    if (signInErr) return { ok: true as const, emailConfirm: false, signInFailed: signInErr.message };
  }

  // 已自动确认（前端直接跳转）；非测试域（email confirm 开启）提示查邮件
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