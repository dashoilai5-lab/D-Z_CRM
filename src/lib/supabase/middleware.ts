import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Edge middleware 用 Supabase session 刷新 + 取当前用户。 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // 会话刷新容错：Supabase getuser() 在 refresh token 失效时会 throw（如项目迁移后旧会话），
  // 此时清掉旧 auth cookie、按未登录处理（middleware 据此跳登录），避免整个页面 500。
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const r = await supabase.auth.getUser();
    user = r.data.user;
  } catch (e) {
    for (const c of request.cookies.getAll()) {
      if (c.name.startsWith("sb-")) {
        response.cookies.set(c.name, "", { maxAge: -1, path: "/" });
        request.cookies.set(c.name, "");
      }
    }
  }
  return { response, user, supabase };
}
