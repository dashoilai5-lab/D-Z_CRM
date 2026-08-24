// Defense in depth: the sidebar hides links (UX), this re-checks the same
// registry at the request level (authorization).
//
// Three auth modes:
//  1. Supabase Auth — sb-*-auth-token present (production). Business-level
//     authorization is enforced server-side (nav-registry/permissions + RLS
//     via JWT claims); middleware only gates unauthenticated requests.
//  2. Demo mode — dz_demo_persona cookie (dev/e2e only, e2e-compatible).
//  3. Legacy real auth — dz_session signed token (prototype auth).
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { PERSONA_COOKIE, type DemoPersona } from "@/lib/persona";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth/session-core";
import { accessibleHrefs } from "@/lib/nav-registry";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/workshop")) return NextResponse.next();

  // 1. Supabase Auth session (production). getUser() also refreshes tokens.
  const { response, user } = await updateSession(req);
  if (user) return response;

  // 2. Demo persona (dev/e2e): nav-registry URL gating on persona cookie.
  const raw = req.cookies.get(PERSONA_COOKIE)?.value as DemoPersona | undefined;
  const hasPersona = raw && (["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as string[]).includes(raw);
  if (hasPersona) {
    if (raw === "CUSTOMER") {
      return NextResponse.redirect(new URL("/rider/home", req.url));
    }
    const allowed = accessibleHrefs(raw as DemoPersona);
    if (allowed.some((href) => matchesPrefix(pathname, href))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/workshop/dashboard", req.url));
  }

  // 3. Legacy real auth: signed session token (prototype, kept for migration).
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifyToken(token);
  if (!payload) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/workshop/:path*"],
};
