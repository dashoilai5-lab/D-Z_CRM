import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, signToken, createSessionPayload, verifyToken, type SessionPayload } from "@/lib/auth/session-core";
import type { User } from "@prisma/client";

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  const token = await signToken(createSessionPayload(userId));
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  return db.user.findUnique({ where: { id: payload.uid } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
