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
- [ ] 创建 Supabase 项目（记 Project URL / anon key / service role key）
- [ ] DATABASE_URL 指向 Supabase Postgres（连接串含 password）
- [ ] pnpm exec prisma migrate deploy 到 Supabase
  - ⚠️ SQLite→Postgres 差异检查：enum（Prisma 自动建 type）、Json 字段（SQLite 宽松 vs PG 严格）、cuid、布尔默认值
  - ⚠️ 中文/马来文文案字段：确认 PG text 无编码问题（默认 UTF-8 OK）
- [ ] 数据迁移脚本：dev.db → Postgres（用户/客户/工单/发票/产品/库存全量）——写一次性脚本 scripts/migrate-sqlite-to-pg.ts

### A2. RLS（Row Level Security）
- [ ] 启用 RLS：按 organisationId（tenant）隔离所有业务表
- [ ] 分支级策略（branchId）：门店数据隔离
- [ ] 角色级策略（Owner 全量 / Counter / Mechanic 自己 / Rider 自己客户）
- [ ] 迁移后移除 SQLite 路径，DATABASE_URL 仅指向 Postgres

### A3. 认证（替换 demo persona cookie）
- [ ] Supabase Auth：email/phone + OTP，替换 dz_demo_persona
- [ ] User / Customer 与 Auth 用户关联（id 对齐：User.authId 或映射表）
- [ ] 部门角色映射到 Auth role（现有 16 角色枚举复用）
- [ ] middleware.ts 从 cookie-persona 改真实 session（现有 nav-registry/权限引擎复用）
- [ ] 登录页已存在（/login + scrypt/HMAC/MFA 原型）——与 Supabase Auth 合并或替换

### A4. Demo 清理（上线前必须移除）
- [ ] 移除 demo-only：resetDemo、persona switcher（DemoBar 生产隐藏或条件渲染）
- [ ] 移除 dashboard「Demo customer」硬编码（Ahmad）、getDemoCustomer/getDemoUser
- [ ] mock providers 关闭（见阶段 B）
- [ ] 确定性 seed 仅用于 staging（生产用真实数据迁移）

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

- [ ] Vercel 部署：创建项目 → 连接 GitHub repo → 配置 env（§2 表）→ 域名 + SSL（自定义域或 vercel.app）
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
- [ ] 写数据迁移脚本骨架（scripts/migrate-sqlite-to-pg.ts，Prisma read dev.db + write PG）
- [ ] DemoBar 生产条件渲染方案设计（env 控制）
- [ ] middleware.ts 双模式改造预研（cookie 模式保留 dev/e2e）

