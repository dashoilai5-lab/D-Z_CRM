// Defense in depth: the sidebar hides links (UX), this re-checks the same
// registry at the request level (authorization for the prototype). Production
// will layer Supabase Auth + Postgres RLS on top (docs/HANDOFF.md §65).
//
// Two auth modes:
//  1. Demo mode — dz_demo_persona cookie present (existing behavior, e2e-compatible).
//  2. Real auth — dz_session signed token required; otherwise redirect to /login.
import { NextRequest, NextResponse } from "next/server";
import { PERSONA_COOKIE, type DemoPersona } from "@/lib/persona";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth/session-core";
import { accessibleHrefs } from "@/lib/nav-registry";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/workshop")) return NextResponse.next();

  const raw = req.cookies.get(PERSONA_COOKIE)?.value as DemoPersona | undefined;
  const hasPersona = raw && (["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as string[]).includes(raw);
  if (hasPersona) {
    // CUSTOMER has no workshop surface.
    if (raw === "CUSTOMER") {
      return NextResponse.redirect(new URL("/rider/home", req.url));
    }
    const allowed = accessibleHrefs(raw as DemoPersona);
    if (allowed.some((href) => matchesPrefix(pathname, href))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/workshop/dashboard", req.url));
  }

  // Real auth: require a valid signed session token (AUTH-001/006/007).
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
