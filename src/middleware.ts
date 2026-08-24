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

// Rider 顾客私有页（未登录需登录；登录页/公开页放行）
const RIDER_PRIVATE = ["/rider/bookings", "/rider/approvals", "/rider/invoices", "/rider/motorcycles", "/rider/profile", "/rider/service-status", "/rider/service-history", "/rider/notifications"];
function isRiderPrivate(pathname: string): boolean {
  return RIDER_PRIVATE.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isWorkshop = pathname.startsWith("/workshop");

  // 注入 x-pathname（server layout 读当前路径）
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Supabase Auth session (production). getUser() also refreshes tokens.
  const { response, user } = await updateSession(req);
  if (user) {
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // rider 私有页：生产未登录 → 重定向到 /rider/login
  if (!isWorkshop && isRiderPrivate(pathname)) {
    const url = new URL("/rider/login", req.url);
    url.searchParams.set("next", pathname);
    const r = NextResponse.redirect(url);
    r.headers.set("x-pathname", pathname);
    return r;
  }

  // 非 workshop 路径（rider 等）：无 Supabase session 时放行——页面自身处理登录引导/重定向。
  // 只有 workshop 路径才走 demo persona 与 legacy session 逻辑。
  if (!isWorkshop) {
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // 2. Demo persona (dev/e2e ONLY): nav-registry URL gating on persona cookie.
  //    Production never accepts the demo persona — real auth only.
  const isProd = process.env.NODE_ENV === "production";
  const raw = req.cookies.get(PERSONA_COOKIE)?.value as DemoPersona | undefined;
  const hasPersona = !isProd && raw && (["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as string[]).includes(raw);
  if (hasPersona) {
    if (raw === "CUSTOMER") {
      const r = NextResponse.redirect(new URL("/rider/home", req.url));
      r.headers.set("x-pathname", pathname);
      return r;
    }
    const allowed = accessibleHrefs(raw as DemoPersona);
    if (allowed.some((href) => matchesPrefix(pathname, href))) {
      response.headers.set("x-pathname", pathname);
      return response;
    }
    const r = NextResponse.redirect(new URL("/workshop/dashboard", req.url));
    r.headers.set("x-pathname", pathname);
    return r;
  }

  // 3. Legacy real auth: signed session token (prototype, kept for migration).
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifyToken(token);
  if (!payload) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    const r = NextResponse.redirect(url);
    r.headers.set("x-pathname", pathname);
    return r;
  }
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/workshop/:path*", "/rider/:path*"],
};
