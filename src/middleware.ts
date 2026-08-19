// Defense in depth: the sidebar hides links (UX), this re-checks the same
// registry at the request level (authorization for the prototype). Production
// will layer Supabase Auth + Postgres RLS on top (docs/HANDOFF.md §65).
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
    raw && (["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as string[]).includes(raw) ? raw : "OWNER";

  // CUSTOMER has no workshop surface.
  if (persona === "CUSTOMER") {
    return NextResponse.redirect(new URL("/rider/home", req.url));
  }

  const allowed = accessibleHrefs(persona);
  if (allowed.some((href) => matchesPrefix(pathname, href))) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/workshop/dashboard", req.url));
}

export const config = {
  matcher: ["/workshop/:path*"],
};
