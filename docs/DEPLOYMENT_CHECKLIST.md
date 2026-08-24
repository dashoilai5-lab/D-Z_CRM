# D&Z Platform — 部署准备清单（Deployment Checklist）

> 整理日期：2026-08-21。目标：从本地原型（SQLite + demo persona + mock provider）
> 迁移到生产（Vercel + Supabase Postgres + 真实 Auth/Provider）。
> 详细迁移框架见 SETUP_AND_PREPARATION.md §5；本清单是可直接执行的分阶段行动表。

---

## 0 · 现状快照（已就绪 / 可部署的资产）

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 代码库 | ✅ | Next.js 16.3.1 + React 19 + Prisma 6.19（17 个迁移链，SQLite） |
| 构建 | ✅ | pnpm build 通过；pnpm start 生产模式可用 |
| CI | ✅ | .github/workflows/ci.yml：lint → tsc → vitest(20) → playwright(75+6) → build |
| 回归基线 | ✅ | tsc 0 错 / unit 20 / e2e 75 passed + 6 skipped |
| Provider 抽象 | ✅ | src/providers/：messaging / ai / payment / storage / notification 五接口 + types |
| i18n | ✅ | en/zh/ms 三语（395+ 词条），server t() / client useLang() |
| 配置中心 | ✅ | SETUP_AND_PREPARATION.md（§2 env / §3 迁移 / §5 生产清单 / §9 台账） |
| 基础 env | ✅ | NEXT_PUBLIC_BASE_URL（LAN 真机预览已配置） |

**结论**：原型功能完整、可演示、CI 绿。**距离生产上线的主要工作 = 数据层换 Postgres + 认证换真实 + Provider 换真 + 部署**。

---

## 1 · 推荐部署路径（决策）

Vercel（托管 Next.js）+ Supabase（Postgres + Auth + Storage + RLS）

- 为什么：Next.js 官方推荐宿主；Supabase 一个账号覆盖 DB/Auth/Storage/RLS；本地 Provider 抽象已按此设计（NEXT_PUBLIC_SUPABASE_* env 已预留）
- 备选：AWS Amplify / Railway（如已有 AWS 生态）；数据库 Postgres 是硬要求（SQLite 不适合多实例生产）

---

## 2 · 阶段 A — 上线必需（Critical Path）

> 完成这些才可算能上线。预计工作量：3-5 天（含测试）。

### A1. Supabase 项目与数据库
- [x] 创建 Supabase 项目（ref `dukbfgqbrprivnzcsrlh`；Project URL / anon / service_role 已入 .env）
- [x] DATABASE_URL 指向 Supabase Postgres——连接串已入 .env 的 `DST_DATABASE_URL`（直连 db.dukbfgqbrprivnzcsrlh.supabase.co:5432）
- [x] 建表到 Supabase——⚠️ 不能 migrate deploy（schema provider 锁 sqlite + 迁移文件 SQLite 方言），改用 `prisma migrate diff --from-empty` 生成 PG 基线 `docs/pg-baseline.sql`（61 表 / 21 enum / 211 语句）在目标库执行，0 错误
  - ⚠️ SQLite→Postgres 差异检查：enum 自动建 type ✅；Json 字段实际是 String 类型（清单 §6 担忧不成立）✅；cuid 字符串直迁 ✅
- [x] 数据迁移执行成功：`scripts/migrate-sqlite-to-pg.ts` 全量 61 模型 5060 行 / 0 失败 / 2.6s；验证行数与 FK 关联完整（Ahmad→2 摩托）。注意：Supabase 自签证书 → 脚本自动放宽校验（仅迁移场景）；.env 连接串去掉 sslmode=require（pg 8.23 会按 verify-full 失败）

### A2. RLS（Row Level Security）
- [x] 启用 RLS：61 张表全部 ENABLE ROW LEVEL SECURITY + 61 个 tenant_isolation_* 策略（docs/rls-policies.sql，生成器 scripts/gen-rls-policies.ts，可重复执行）
- [x] 组织级隔离：orgId 硬过滤（含 admin，跨 org 返回 0）；无 organisationId 的表经 FK JOIN 链 EXISTS 推导（BFS 到 Organisation，避免自引用递归）
- [x] 分支级策略：非 admin 限 branchId（空 branchId 行视为全分支可见）；实测 COUNTER 104→53（分支过滤生效）
- [x] 角色级策略：admin（SUPER_ADMIN/OWNER/HEAD_OFFICE_ADMIN）组织内全量；MECHANIC 限本人 mechanicId 工单；CUSTOMER（rider）只见过自己 id（Customer 自身表按 id，子表按 customerId）
- [x] 身份来源：request.jwt.claims（orgId/branchId/role/userId/customerId），helper 函数 app_current_*；⚠️ 生效条件 = 连接角色非 BYPASSRLS（authenticated 已测通；postgres/service_role 绕过——本地应用继续全量，A3 认证切换后按 JWT 注入 claims 即自动生效）
- [ ] 迁移后移除 SQLite 路径，DATABASE_URL 仅指向 Postgres（待 A3 认证切换后统一处理；本地 dev/e2e 保留 SQLite）

### A3. 认证（替换 demo persona cookie）
- [x] Supabase Auth：email/password + OTP，替换 dz_demo_persona（新增 Account tab，demo 保留 dev/e2e）
- [x] User / Customer 与 Auth 用户关联：User.authId / Customer.authId（迁移 supabase_auth_link，三库同步）
- [x] 部门角色映射到 Auth role（16 角色枚举复用，经 JWT claims 注入）
- [x] middleware.ts 三路径：Supabase session（生产）→ demo persona（dev/e2e）→ legacy dz_session
- [x] 登录页 /login 接入 Supabase Auth（Account=Supabase / Legacy=原型 / Demo=persona），保留 scrypt/MFA
- [x] JWT claims 注入：orgId/branchId/role/userId/customerId（user_metadata）→ RLS 读取生效；实测登录链路 + claims 验证通过
- [ ] 生产切 authenticated 角色连 PG（连接池 + RLS 强制）——上线前最后一步（当前 postgres 绕过保本地兼容）

### A4. Demo 清理（上线前必须移除）
- [x] middleware demo persona 加 NODE_ENV 守卫（生产只认 Supabase session；demo persona 仅 dev/e2e）——已随 Vercel 部署完成
- [ ] 移除 demo-only：resetDemo、persona switcher（DemoBar 生产隐藏或条件渲染）——剩余
- [ ] 移除 dashboard「Demo customer」硬编码（Ahmad）、getDemoCustomer/getDemoUser——剩余（rider 生产走 Supabase 后适用）
- [x] Storage mock 关闭：生产自动切 Supabase Storage（bucket dz-assets public，上传/公开读实测通过）——已随部署完成
- [ ] 确定性 seed 仅用于 staging（生产用真实数据迁移）——剩余

---

## 3 · 阶段 B — 上线即做（Provider 换真）

> Provider 接口已抽象，替换实现不碰业务层（设计目标）。

| Provider | 现状（原型） | 生产实现 | 需要的资源 |
| --- | --- | --- | --- |
| Messaging | mock-whatsapp.ts | Meta WhatsApp Business API（Cloud API） | WHATSAPP_API_TOKEN、WHATSAPP_PHONE_ID、Business 账号 |
| AI | mock-ai.ts（规则文案） | OpenAI | OPENAI_API_KEY |
| Storage | local.ts（./storage 文件） | Supabase Storage（bucket：posters/products） | Supabase 项目（同 A1） |
| Payment | mock | Stripe / FPX（Malaysia） | STRIPE_SECRET_KEY 或 FPX 网关 |
| Notification | mock | FCM / APNs（真机推送） | Firebase 项目 |

注意：
- Storage 换真后 public/posters/、public/products/、/api/storage/ 路径要迁到 bucket（保留 URL 兼容或重写）
- 海报/产品图已入库（imageUrl），迁移时改 URL 前缀即可

---

## 4 · 阶段 C — 上线后（可并行）

- [x] Vercel 部署：d-z-crm 项目（https://d-z-crm.vercel.app）——7 个生产 env 已配（DATABASE_URL 用 Supabase 连接池串 + ?pgbouncer=true&connection_limit=1，AUTH_SECRET，NEXT_PUBLIC_*，SERVICE_ROLE，STORAGE_BUCKET）；vercel.json 指定构建用 schema.pg.prisma（postgresql provider，双 schema 方案）；实测首页/login/rider/catalogue 200、真实 Supabase 登录 OK、workshop 未登录 307→login
- [ ] Sentry：SENTRY_DSN + @sentry/nextjs（错误监控）
- [ ] k6 压测（staging）：10/100/500/1000 并发，目标 p95 < 2s；重点：dashboard/列表页/CSV 导出
- [ ] 生产功能启用（原型已实现，等部署后开）：
  - Vercel Cron 定时提醒（crons.json → 现有 sendDueReminders）
  - 群发模板化 + 发送统计
- [ ] 素材/静态资源迁 CDN（或 Supabase Storage 兼）

---

## 5 · 需要的账号与密钥（一次性收集）

| 服务 | 用途 | 获取 | 优先级 |
| --- | --- | --- | --- |
| Supabase | Postgres + Auth + Storage + RLS | supabase.com 注册 | A |
| Vercel | Next.js 托管 | vercel.com（GitHub 登录） | A |
| Meta WhatsApp Business | 客户消息 | business.facebook.com 验证企业 | B |
| OpenAI | AI 推荐/海报 | platform.openai.com | B |
| Stripe 或 FPX 网关 | 支付 | stripe.com / 本地银行 | B |
| Sentry | 错误监控 | sentry.io | C |

---

## 6 · 风险与注意事项

1. SQLite→Postgres：enum 自动转换 OK；但 Json 字段（operatingHours、compatibleModels 等）在 PG 需确保 JSON 合法（seed 已是 JSON）
2. demo 数据泄漏：上线前务必清空/迁移干净，不留 Ahmad/测试数据在生产
3. e2e 不受影响：e2e 用独立 e2e.db，生产迁移不影响本地测试（global-setup 逻辑不变）
4. NEXT_PUBLIC_BASE_URL：生产改为正式域名（build 时注入，改后 rebuild）
5. 回滚：迁移先 staging 验证；数据迁移脚本可逆（先备份 PG）
6. 本地开发兼容：保留 SQLite dev 路径（.env 切换），仅生产用 PG

---

## 7 · 立即可以做的（不需要任何账号）

- [ ] 更新 SETUP §5 勾选状态（随进度打勾）
- [x] 写数据迁移脚本骨架（scripts/migrate-sqlite-to-pg.ts，Prisma read dev.db + write PG）——已完成，见 A1
- [ ] DemoBar 生产条件渲染方案设计（env 控制）
- [ ] middleware.ts 双模式改造预研（cookie 模式保留 dev/e2e）

