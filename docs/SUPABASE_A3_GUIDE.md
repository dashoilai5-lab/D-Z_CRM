# Supabase 阶段 A3 执行指南（认证替换 demo persona）

> 目标：用 Supabase Auth（email/phone + OTP）替换 dz_demo_persona 身份系统，
> 并让 A2 的 RLS 策略真正生效（authenticated 角色 + JWT claims）。
> 对应 DEPLOYMENT_CHECKLIST.md A3。前置：A1（数据库迁移）✅ + A2（RLS 策略）✅ 已完成。

---

## 背景：现有认证 vs Supabase Auth

| 维度 | 现有（原型） | Supabase Auth（生产） |
| --- | --- | --- |
| 登录 | /login + scrypt + HMAC session（dz_session cookie） | email/password + OTP，session 由 Supabase 管理 |
| 身份 | dz_demo_persona cookie（OWNER/COUNTER_STAFF/MECHANIC/CUSTOMER） | auth.users（UUID）+ JWT |
| 关联 | User 表即身份 | User.authId → auth.users.id 映射 |
| 角色 | User.role（16 枚举） | JWT claims 注入 role（复用枚举） |
| 数据隔离 | 应用层 nav-registry + permissions.ts | A2 RLS 策略（authenticated 角色强制） |

**核心设计**：保留 demo persona 模式（dev/e2e 依赖），新增 Supabase Auth 作为生产模式。
middleware 双路径：有 Supabase session → 真实用户；否则回退 demo persona（仅非生产）。

---

## 步骤总览

| 步骤 | 内容 | 类型 |
| --- | --- | --- |
| A3.1 | Supabase Dashboard 配置 Auth（providers/URL/邮件模板） | 控制台 |
| A3.2 | 安装 SDK + 创建 supabase client（browser/server/middleware 三件套） | 代码 |
| A3.3 | 数据模型：User.authId / Customer.authId + 迁移 + seed 关联 | 代码 |
| A3.4 | 认证服务：sign-in / sign-up / otp / session 刷新 / claims 注入 | 代码 |
| A3.5 | middleware 双路径改造（Supabase session 优先，demo 回退） | 代码 |
| A3.6 | 登录页接入 Supabase Auth（保留 demo 入口） | 代码 |
| A3.7 | 验证：真实登录 → claims → RLS 生效；回归 dev/e2e | 测试 |

---

## A3.1 Supabase Dashboard 配置（用户操作）

登录 supabase.com → 项目 dukbfgqbrprivnzcsrlh → **Authentication**：

1. **Providers** → Email：开启（默认）。若用手机 OTP：开启 Phone，设默认国家代码 +60（马来西亚）。
2. **URL Configuration**：Site URL = `http://localhost:3002`（本地）或正式域名；
   Redirect URLs 加 `http://localhost:3002/**`（本地 dev 回调）。
3. **Email Templates**：确认 Confirm signup / Reset password 模板可用（默认即可，本地不真发信）。
4. **API Settings**：确认 Project URL + anon key 与 .env 一致（已配）。

> 本地开发不发真实邮件：Supabase 默认把验证链接打在控制台日志里，dev 模式下我们直接读取会话即可。

---

## A3.2 安装 SDK + supabase client 三件套

```bash
pnpm add @supabase/ssr @supabase/supabase-js
```

创建三个 client（全部从 .env 读 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY）：

### src/lib/supabase/client.ts（浏览器端）
```ts
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### src/lib/supabase/server.ts（Server Components / Actions）
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Component 中忽略——middleware 负责刷新 */ }
      },
    },
  });
}
```

### src/lib/supabase/middleware.ts（Edge middleware 用）
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
```

---

## A3.3 数据模型：User.authId / Customer.authId

### 迁移（prisma/schema.prisma）
```prisma
model User {
  ...
  authId String? @unique   // Supabase auth.users.id（生产登录）
}

model Customer {
  ...
  authId String? @unique   // Supabase auth.users.id（rider 登录）
}
```

```bash
pnpm exec prisma migrate dev --name supabase_auth_link
DATABASE_URL=file:./e2e.db pnpm exec prisma migrate deploy
```

> ⚠️ e2e 数据库需同步迁移（global-setup 会跑 migrate deploy）。
> 生产 PG 需同步：migrate diff 生成增量 SQL 在 Supabase 执行（同 A1 方案）。

### seed 补充
给 demo 用户预置 authId 或留空（demo 模式不依赖 Supabase）。

---

## A3.4 认证服务

### src/actions/auth-supabase.ts（新 server actions）

```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false, error: error.message };
  return { ok: true } as const;
}

export async function signInWithOtp(input: { email: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: input.email });
  if (error) return { ok: false, error: error.message };
  return { ok: true } as const;
}

export async function verifyOtp(input: { email: string; token: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: input.email, token: input.token, type: "email" });
  if (error) return { ok: false, error: error.message };
  return { ok: true } as const;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

### claims 注入（关键：RLS 生效的前提）

登录成功后，把业务身份写入 **JWT claims**（RLS 读 request.jwt.claims）：

```ts
// 登录成功回调 / middleware 中：
// 查 User.authId → 拿到 User（orgId/branchId/role/userId）
const biz = await db.user.findUnique({ where: { authId: user.id } });
await supabase.auth.updateUser({
  data: {
    orgId: biz.organisationId,
    branchId: biz.branchId ?? "",
    role: biz.role,
    userId: biz.id,
    customerId: "", // rider 时填 Customer.id
  },
});
```

> 写入 user_metadata 即进 JWT claims。middleware 每次请求从 JWT 读 claims → 设置 request.jwt.claims
> → authenticated 角色连接时 RLS 自动按 claims 过滤。

---

## A3.5 middleware 双路径

在现有 src/middleware.ts 之上：

```ts
// 1. 先跑 Supabase session 检查
const { response, user } = await updateSession(req);
if (user) {
  // 2a. 真实登录：查 User.authId → 用现有 nav-registry + permissions 授权
  //     + 把 claims 写入 request header（后端读 → SET LOCAL request.jwt.claims）
  return response;
}
// 2b. demo 模式（非生产）：保留现有 persona cookie 逻辑
if (process.env.NODE_ENV !== "production") { ...现有 persona 分支... }
// 3. 都无 → 重定向 /login
```

---

## A3.6 登录页接入

/login 页加两个 tab：**Email 登录**（Supabase password）与 **OTP**（发码+验证），
保留底部「Demo mode」链接（非生产）：点选 persona 直接进入（现有 setPersona）。

---

## A3.7 验证

1. **真实登录链路**：/login 用 Supabase email/password（先建一个测试用户）→ 进 workshop
   → middleware 走真实路径 → User 查得到
2. **RLS 生效**：作为 authenticated 角色 + claims 连接，验证 OWNER 104 / CUSTOMER 1（A2 测试复用）
3. **回归**：pnpm test（20）+ tsc 0 + Playwright 75+6skip（demo persona 模式不受影响）

---

## 风险与注意

1. demo persona 是 e2e 的根基——middleware 必须在非生产保留 persona 分支，e2e 才能继续
2. Supabase session cookie（sb-*-auth-token）与 dz_session 并存：dz_session 可逐步退役
3. claims 注入依赖登录回调里查库——登录热点会查一次 User，可接受
4. RLS 生效需应用改用 authenticated 角色连 PG（当前 postgres 绕过）——分两步：
   - 本阶段：策略就绪 + claims 注入链路打通（RLS 逻辑可测）
   - 上线前：DATABASE_URL 切 authenticated 角色连接串（连接池 + RLS 强制）
