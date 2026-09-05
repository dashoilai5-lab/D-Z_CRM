// Defense in depth: the sidebar hides links (UX), this re-checks the same
// registry at the request level (authorization).
//
// Two auth modes:
//  1. Supabase Auth — sb-*-auth-token present. Business-level authorization
//     is enforced server-side (nav-registry/permissions + RLS via JWT
//     claims); middleware only gates unauthenticated requests.
//  2. Legacy real auth — dz_session signed token (prototype, kept for migration).
// No demo mode, no persona — production only accepts real auth.
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth/session-core";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

// Rider 顾客私有页（未登录需登录；登录页/公开页放行）
const RIDER_PRIVATE = ["/rider/bookings", "/rider/approvals", "/rider/invoices", "/rider/motorcycles", "/rider/profile", "/rider/settings", "/rider/service-status", "/rider/service-history", "/rider/notifications"];
function isRiderPrivate(pathname: string): boolean {
  return RIDER_PRIVATE.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isWorkshop = pathname.startsWith("/workshop");

  // 注入 x-pathname（server layout 读当前路径）
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Supabase Auth session. getUser() also refreshes tokens.
  const { response, user } = await updateSession(req);
  if (user) {
    // —— 路由隔离矩阵（角色级；layout 层用 DB 权威数据兜底）——
    // JWT claims 由登录时 injectBizClaims 写入 user_metadata（orgId/branchId/role/userId/customerId）
    const role = (user.user_metadata?.role as string) ?? "";
    const isCustomer = role === "CUSTOMER";
    const isMechanic = role === "MECHANIC";
    const go = (path: string): NextResponse => {
      const url = new URL(path, req.url);
      const r = NextResponse.redirect(url);
      r.headers.set("x-pathname", pathname);
      return r;
    };

    // /workshop/*：仅员工且非 MECHANIC（rider → rider app，mechanic → mechanic app）
    if (pathname.startsWith("/workshop")) {
      if (isCustomer) return go("/rider/home");
      if (isMechanic) return go("/mechanic-app");
    }
    // /mechanic-app/*：仅 MECHANIC
    if (pathname.startsWith("/mechanic-app")) {
      if (isCustomer) return go("/rider/home");
      if (!isMechanic) return go("/workshop/dashboard");
    }
    // /rider/* 私有页：仅 CUSTOMER
    if (isRiderPrivate(pathname)) {
      if (isMechanic) return go("/mechanic-app");
      if (!isCustomer) return go("/workshop/dashboard");
    }
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // rider 私有页：未登录 → 重定向到 /rider/login。
  if (!isWorkshop && isRiderPrivate(pathname)) {
    const url = new URL("/rider/login", req.url);
    url.searchParams.set("next", pathname);
    const r = NextResponse.redirect(url);
    r.headers.set("x-pathname", pathname);
    return r;
  }

  // mechanic-app：未登录 → 技师专属登录页（/mechanic-app/login 本身放行）
  if (pathname.startsWith("/mechanic-app")) {
    if (pathname === "/mechanic-app/login") {
      response.headers.set("x-pathname", pathname);
      return response;
    }
    const url = new URL("/mechanic-app/login", req.url);
    url.searchParams.set("next", pathname);
    const r = NextResponse.redirect(url);
    r.headers.set("x-pathname", pathname);
    return r;
  }

  // 非 workshop 路径（rider 等）：无 Supabase session 时放行——页面自身处理登录引导/重定向。
  // 只有 workshop 路径才走 legacy session 逻辑。
  if (!isWorkshop) {
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // 2. Legacy real auth: signed session token (prototype, kept for migration).
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
  matcher: ["/workshop/:path*", "/rider/:path*", "/mechanic-app/:path*"],
};
