"use server";

import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { generateTotpSecret, verifyTotp } from "@/lib/auth/totp";
import { audit } from "@/lib/auth/audit";
import { randomBytes } from "node:crypto";

const ADMIN_ROLES = ["SUPER_ADMIN", "OWNER", "HEAD_OFFICE_ADMIN", "MANAGER"];
const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

export type AuthResult =
  | { ok: true; user: { id: string; name: string; role: string; email: string | null } }
  | { ok: false; error: string; mfaRequired?: boolean };

export async function login(input: { email: string; password: string; mfaCode?: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await db.user.findFirst({ where: { email } });
  if (!user || !user.passwordHash) {
    return { ok: false, error: "Invalid email or password." };
  }
  // brute-force lockout (AUTH-013)
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, error: "Account temporarily locked. Try again later." };
  }
  if (!verifyPassword(input.password, user.passwordHash)) {
    const failed = user.failedLoginCount + 1;
    const locked = failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MS) : null;
    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: failed, lockedUntil: locked } });
    await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "LOGIN_FAILED", entity: "USER", entityId: user.id, after: { failed } });
    return { ok: false, error: locked ? "Too many attempts. Account locked for 15 minutes." : "Invalid email or password." };
  }
  // disabled users cannot log in (AUTH-008/009)
  if (!user.active) {
    await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "LOGIN_BLOCKED_DISABLED", entity: "USER", entityId: user.id });
    return { ok: false, error: "This account has been disabled. Contact your administrator." };
  }
  // admin MFA (AUTH-010)
  if (user.mfaSecret && ADMIN_ROLES.includes(user.role)) {
    if (!input.mfaCode || !verifyTotp(user.mfaSecret, input.mfaCode)) {
      return { ok: false, error: "MFA code required or invalid.", mfaRequired: true };
    }
  }
  await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createSession(user.id);
  await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "LOGIN", entity: "USER", entityId: user.id });
  return { ok: true, user: { id: user.id, name: user.name, role: user.role, email: user.email } };
}

export async function logout(): Promise<{ ok: true }> {
  await destroySession();
  return { ok: true };
}

export async function me() {
  const user = await getCurrentUser();
  if (!user) return null;
  return { id: user.id, name: user.name, role: user.role, email: user.email, active: user.active };
}

export async function forgotPassword(input: { email: string }): Promise<{ ok: true; devToken?: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const user = await db.user.findFirst({ where: { email } });
  if (!user) return { ok: false, error: "If that email exists, a reset link was sent." };
  const token = randomBytes(24).toString("hex");
  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "PASSWORD_RESET_REQUESTED", entity: "USER", entityId: user.id });
  // Demo environment: return the token so the flow can be exercised end-to-end.
  return { ok: true, devToken: process.env.NODE_ENV === "production" ? undefined : token };
}

export async function resetPassword(input: { token: string; newPassword: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const user = await db.user.findFirst({
    where: { resetToken: input.token, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) return { ok: false, error: "Reset token invalid or expired." };
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(input.newPassword), resetToken: null, resetTokenExpiresAt: null, failedLoginCount: 0 },
  });
  await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "PASSWORD_RESET", entity: "USER", entityId: user.id });
  return { ok: true };
}

export async function verifyEmail(input: { token: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await db.user.findFirst({ where: { verifyToken: input.token } });
  if (!user) return { ok: false, error: "Verification token invalid." };
  await db.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyToken: null } });
  await audit({ organisationId: user.organisationId, branchId: user.branchId, userId: user.id, action: "EMAIL_VERIFIED", entity: "USER", entityId: user.id });
  return { ok: true };
}

export async function enableMfa(): Promise<{ ok: true; secret: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  if (!ADMIN_ROLES.includes(user.role)) return { ok: false, error: "MFA is available for administrator roles only." };
  const secret = generateTotpSecret();
  await db.user.update({ where: { id: user.id }, data: { mfaSecret: secret } });
  return { ok: true, secret };
}

export async function disableMfa(input: { code: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || !user.mfaSecret) return { ok: false, error: "MFA not enabled." };
  if (!verifyTotp(user.mfaSecret, input.code)) return { ok: false, error: "Invalid code." };
  await db.user.update({ where: { id: user.id }, data: { mfaSecret: null } });
  return { ok: true };
}
