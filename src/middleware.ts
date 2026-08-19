// Defense in depth (§2 of the nav design): the sidebar only hides links —
// hiding a nav item is UX, never the authorization boundary. This middleware
// re-checks the same NAV_SECTIONS registry at the request level and redirects
// a persona hitting a URL they are not entitled to. In production this layer
// sits behind Supabase Auth + Postgres RLS (see docs/HANDOFF.md §65).
import { NextRequest, NextResponse } from "next/server";
import { PERSONA_COOKIE, type DemoPersona } from "@/lib/persona";
import { accessibleHrefs } from "@/lib/nav-registry";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/workshop")) return NextResponse.next();

  const raw = req.cookies.get(PERSONA_COOKIE)?.value as DemoPersona | undefined;
  const persona: DemoPersona =
    raw && (["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as string[]).includes(raw)
      ? raw
      : "OWNER";

  // CUSTOMER has no workshop surface — the rider app is their home.
  if (persona === "CUSTOMER") {
    return NextResponse.redirect(new URL("/rider/home", req.url));
  }

  // Page-level check against the registry (same source of truth as the sidebar).
  const allowed = accessibleHrefs(persona);
  if (allowed.some((href) => matchesPrefix(pathname, href))) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/workshop/dashboard", req.url));
}

export const config = {
  matcher: ["/workshop/:path*"],
};
