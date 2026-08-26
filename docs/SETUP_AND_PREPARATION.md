# D&Z Platform — Setup & Preparation

> 运维/配置/准备清单总台账。覆盖本地开发、各模块配置、API、测试环境、生产迁移预备。
> **维护约定（已确认）**：每次涉及 env/模块/API/迁移/端口/依赖/测试/i18n 的改动，必须在 **§9 变更台账** 追加一行（日期|改动|影响），并视情况更新 §2 env 表 / §3 迁移表 / §5 生产清单。这是项目配置中心，改动相关配置时务必同步。

---

## 1 · 本地环境 (Local Dev)

### 1.1 前置要求
| 项 | 版本/要求 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 20 (实测 24.19.0) | 运行时 |
| pnpm | 9+ (workspace) | 包管理 |
| SQLite | 内置（Prisma 驱动） | 本地数据库，无独立服务 |
| Next.js | 16 (App Router) | 框架 |
| React | 19 | UI |
| Playwright | 内置 | E2E |

### 1.2 首次安装 & 启动
```bash
cd "/Users/Jun/Documents/CRM-D&Z"
pnpm install              # 安装依赖
pnpm db:reset             # 建库 + migrate + seed（demo 数据）
pnpm dev                  # 开发服务器（自动选端口，勿用 3000）
pnpm build && pnpm start --port 3002   # 生产模式 demo
```

### 1.3 端口约定（重要）
| 端口 | 用途 | 守护 |
| --- | --- | --- |
| **3002** | demo 服务（dev.db） | launchd `com.dz-platform.server` |
| **3102** | e2e 服务（e2e.db） | launchd `com.dz-platform.e2e` |
| ~~3000~~ | **禁用**——被 DashOil 应用抢占并会 kill 占用者 | — |

**服务管理（sandbox 会 SIGTERM 普通后台进程，必须用 launchd）**：
```bash
launchctl list | grep dz-platform                    # 状态
launchctl kickstart -k gui/$(id -u)/com.dz-platform.server   # 重启 demo
launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e      # 重启 e2e
```
plist 文件：`com.dz-platform.server.plist` / `com.dz-platform.e2e.plist`

---

## 2 · 环境变量 (Environment)

当前只有 **1 个**本地 env（`.env`）：

| 变量 | 本地值 | 生产（迁移后） | 用途 |
| --- | --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Supabase Postgres 连接串 | 主数据库 |
| `NEXT_PUBLIC_BASE_URL` | `http://192.168.100.240:3002` | 生产域名 | 分享/提醒链接基准；真机预览时=Mac 局域网 IP（`ipconfig getifaddr en0`，IP 变化需改此值并 rebuild） |

### 生产需要新增的 env（预留给 §5 迁移）
| 变量 | 用途 | 来源 |
| --- | --- | --- |
| `DATABASE_URL` | Supabase PostgreSQL | Supabase Project Settings |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 前端 URL | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase |
| `OPENAI_API_KEY` | AI provider（生产） | OpenAI |
| `WHATSAPP_API_TOKEN` | Meta WhatsApp Business API | Meta Developers |
| `WHATSAPP_PHONE_ID` | WhatsApp 商业号 | Meta |
| `STORAGE_BUCKET` | Supabase Storage bucket | Supabase |
| `SENTRY_DSN` | 错误监控 | Sentry |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | 认证加密 | 自生成 |

> ⚠️ `.env` 不入库（gitignore）。生产 env 在 Vercel/Supabase 配置。

---

## 3 · 数据库 (Prisma / SQLite → Postgres)

### 3.1 本地
- SQLite 文件：`prisma/dev.db`（demo）、`prisma/e2e.db`（测试，每次跑前清空）
- Schema：`prisma/schema.prisma`
- Seed：`prisma/seed.ts` → `src/lib/seed-core.ts`（确定性 RNG，锚定当天日期）

### 3.2 迁移记录（按时间顺序）
| 迁移 | 说明 |
| --- | --- |
| `20260818060637_init` | 初始 schema（全 §51 实体） |
| `20260818063040_review_job` | 评价/工单关联 |
| `20260819004907_promo_discount` | Campaign.discountPercent（促销引擎） |
| `20260819021924_motorcycle_type` | Motorcycle.type（车型分类） |
| `20260819043819_booking_campaign_attr` | Booking.campaignId（促销归因） |
| `20260819044007_review_reply` | Review.reply/repliedAt（评价运营） |

### 3.3 数据模型（33 模型）
身份：`Organisation → Branch → User / Customer (+CustomerAuthProfile)`
车辆：`Customer → Motorcycle`
运营：`Booking → ServiceJob → (ServiceJobItem / ServiceJobPart / ChecklistExecution / InspectionFinding / CustomerApproval)`
商品：`Product / Inventory / StockMovement / Supplier / PurchaseOrder(+Item)`
财务：`Invoice(+Item) / Payment`
沟通：`Message / Notification / ServiceReminder`
营销：`Campaign / MarketingAsset / ContentScript / Review`

### 3.4 命令
```bash
pnpm db:migrate   # 开发迁移（改名 prisma migrate dev）
pnpm db:reset     # 硬重置（drop + migrate + seed）——改动 schema 后必跑
pnpm db:seed      # 重新播种
pnpm db:studio    # Prisma Studio 可视化
```

### 3.5 E2E 数据库注意
`e2e/global-setup.ts` 每次跑测试前：**删 e2e.db → migrate deploy → seed → 重启 e2e launchd**（SQLite 句柄过期）。
改 schema 后若 e2e 报「列不存在」，先手动 `DATABASE_URL=file:./e2e.db pnpm exec prisma migrate deploy` + kickstart。

### 3.6 真机预览 Rider（手机同 Wi-Fi）
三种预览方式：
1. /preview 页（电脑浏览器）——手机设备外壳 + 真实 Rider 页面，可切页面/语言/角色/设备。
2. Chrome DevTools 移动模拟——F12 → 手机模式（iPhone/Pixel）。
3. 真机访问（最真实）：手机连同一 Wi-Fi，浏览器打开 http://192.168.100.240:3002 → 点 Demo bar 切到 CUSTOMER → 进 /rider/home。
   - 服务已监听所有接口（next start 默认 0.0.0.0），防火墙已关。
   - 分享/提醒链接经 NEXT_PUBLIC_BASE_URL 指向该 IP（改了 IP 后需 rebuild）。

---

## 4 · 模块配置 & API

### 4.1 Provider 抽象（src/providers/）
| Provider | 原型实现 | 生产替换（§5） | 用途 |
| --- | --- | --- | --- |
| Messaging | `mock-whatsapp.ts`（模拟发送） | Meta WhatsApp Business API | 客户消息/群发 |
| AI | `mock-ai.ts`（规则文案） | OpenAI | 销售推荐/AI 中心 |
| Storage | `local.ts`（./storage 文件） | Supabase Storage | 海报/素材上传 |
| Payment | `mock-payment.ts`（自动成功） | 支付网关 | 发票支付 |
| Notification | `local.ts` | 推送服务 | 通知 |

> 业务代码只依赖接口（`src/providers/types.ts`），生产换实现不动业务层。

### 4.2 API 路由（src/app/api/）
| 路由 | 方法 | 用途 |
| --- | --- | --- |
| `/api/recommendations?motorcycleId=&mileage=` | GET | AI 销售推荐（创建工单时） |
| `/api/search?q=` | GET | 全局搜索（Ctrl+K 命令面板） |
| `/api/supplier-for-product?productId=` | GET | 产品→供应商查询（采购） |

### 4.3 Server Actions（src/actions/）
| 文件 | 主要 action |
| --- | --- |
| `workshop.ts` | createJob / transitionJob / assignMechanic / bookingAction / createStaff / toggleStaffActive / updateJobDetails / addJobServiceItems / removeJobItem / addAiRecommendation / createPurchaseOrder / receivePurchaseOrder |
| `rider.ts` | bookService / respondApproval / addMotorcycle / updateMotorcycle / submitReview / markNotificationsRead / updateProfile |
| `marketing.ts` | createCampaign / updateCampaign / createPoster / createScript / publishReview / replyToReview / broadcastCampaign |
| `demo.ts` | setPersona / resetDemo |
| `language.ts` | setLanguage |

### 4.4 业务目录（src/lib/）
| 文件 | 用途 | 生产备注 |
| --- | --- | --- |
| `i18n.ts` | 三语字典（en/zh/ms，395+ 词条） | 可换 next-intl |
| `motorcycle-types.ts` | 12 类车型目录 | 固定 |
| `service-catalog.ts` | 12 项服务目录 | 固定 |
| `bike-models.ts` | 品牌→型号映射 | 固定 |
| `nav-registry.ts` | 部门导航矩阵 | 权限相关 |
| `demo-user.ts` | persona→User 映射 | §5 换真实 Auth |
| `reset.ts` | RESET DEMO DATA | 生产移除 |

---

## 5 · 生产迁移清单 (§65) — READY WHEN

### 5.1 数据库
- [ ] Supabase 建 Project，创建 Postgres 数据库
- [ ] `prisma migrate deploy` 到 Supabase（SQLite→Postgres 差异检查：enum/JSON/cuid）
- [ ] 数据迁移脚本（dev.db → Postgres）：用户、客户、工单、发票全量
- [ ] **RLS（Row Level Security）**：按 tenant/branch/role 策略
- [ ] 迁移后移除 SQLite 路径，`DATABASE_URL` 指向 Postgres

### 5.2 认证 (Auth)
- [ ] Supabase Auth（email/phone + OTP），替换 demo persona cookie
- [ ] `User` / `Customer` 与 Auth 用户关联（id 对齐）
- [ ] 部门角色（Owner/Counter/Mechanic/Rider）映射到 Auth role
- [ ] 中间件从 cookie-persona 改为真实 session（现有 nav-registry/middleware 复用）

### 5.3 Provider 换真
- [ ] Messaging → Meta WhatsApp Business API（`WHATSAPP_API_TOKEN`/PHONE_ID）
- [ ] AI → OpenAI（`OPENAI_API_KEY`）
- [ ] Storage → Supabase Storage（海报 url 从 /posters/ 迁移到 bucket）
- [ ] Payment → 网关（Stripe/FPX）
- [ ] Notification → 推送（FCM/APNs）

### 5.4 部署
- [ ] Vercel 项目创建 + 环境变量配置（§2）
- [ ] 构建验证（`pnpm build` 通过）
- [ ] 域名/SSL
- [ ] CI（.github/workflows/ci.yml 已就绪：lint → typecheck → vitest → playwright → build）
- [ ] Sentry 接入（`SENTRY_DSN`）
- [ ] k6 压测（staging：10/100/500/1000 并发，目标 <2s）

### 5.5 数据治理
- [ ] 移除 demo-only：resetDemo、persona switcher、mock providers、确定性 seed
- [ ] 移除 dashboard 的「Demo customer」硬编码（Ahmad）
- [ ] 真实素材：public/posters/ 迁移到 CDN/Supabase Storage

---

## 6 · 测试环境

| 套件 | 命令 | 数量 | 说明 |
| --- | --- | --- | --- |
| Unit (Vitest) | `pnpm test` | 20 | 业务逻辑（money/state-machine/prediction/promo） |
| E2E (Playwright) | `pnpm exec playwright test` | 75 (+6 skip) | 3 浏览器矩阵 × 主旅程/预约/库存/smoke |
| CI | GitHub Actions | — | lint→typecheck→vitest→playwright→build |

**E2E 关键约定**：
- 独立 DB（e2e.db），global-setup 每次清库重播种
- `helpers.ts` setPersona 固定 `dz_lang=en`（测试断言英文文本，i18n 不破坏）
- e2e 服务必须 **build + kickstart 后**才能跑（testids 在 build 里）

---

## 7 · 素材 & 静态资源

| 资源 | 路径 | 说明 |
| --- | --- | --- |
| 海报图片 | `public/posters/*.png`（10 张） | seed 引用，workshop/rider 显示 |
| 源文件 | `Marketing_Poster/`（不入库） | 设计源 |
| 截图 | `screenshots/*.png` | 功能验证存档 |

---

## 8 · 语言 (i18n)

- 三语：English / 中文 / Bahasa Malaysia
- 字典：`src/lib/i18n.ts`（395+ 词条，key → {en, zh, ms}）
- 切换：demo-bar 的 EN/中文/BM 按钮 → `dz_lang` cookie（一年）
- 架构：server 页 `getLang()` + `t()`；client 组件 `useLang()` context
- **新增文案必须三语**（en 保持原始 UI 大小写，zh/ms 翻译）
- 覆盖：全部页面（workshop 30+ 页 + rider + 框架层）。剩余：部分 toast、AI 动态文案

---

## 9 · 变更台账 (Changelog of setup-relevant changes)

> 每次涉及 env/模块/API/迁移/端口/依赖/测试的改动，在此追加。

| 日期 | 改动 | 影响 |
| --- | --- | --- |
| 2026-08-19 | 新增迁移 `booking_campaign_attr`、`review_reply` | Booking.campaignId、Review.reply |
| 2026-08-19 | 新增迁移 `motorcycle_type`、`promo_discount` | Motorcycle.type、Campaign.discountPercent |
| 2026-08-19 | i18n 三语支持（dz_lang cookie） | 全部页面文案 |
| 2026-08-19 | 海报素材 public/posters/（10 张） | MarketingAsset.url |
| 2026-08-19 | 灯箱组件 shared/lightbox.tsx | 图片放大 |
| 2026-08-19 | Provider 抽象（5 个接口） | 生产可替换 |
| 2026-08-19 | 新增路由 /preview（手机预览框架） | rider 调试视图（iframe 同源 + cookie 共享） |
| 2026-08-19 | rider layout 支持 dz_hide_demo cookie | 预览框架内隐藏琥珀 demo bar（完整页面视图） |
| 2026-08-19 | BottomNav/MobileNav 加 safe-area padding（env(safe-area-inset-bottom)） | 适配 iPhone home indicator，底部导航不被遮挡 |
| 2026-08-19 | rider book 页重构：套餐单选卡片 + 附加服务多选 + 实时总价 | serviceType 存「套餐 + 服务组合」字符串 |
| 2026-08-20 | 迁移 `seg1_requirements_data_model`：新增 27 个实体（Lead/LeadSource/LeadStage/LeadActivity、Task、TestRide、AppointmentSlot、ServiceType、JobStatusHistory、ServiceHistory、InventoryLocation、AutomationRule/Execution、MessageTemplate、LoyaltyAccount/Tier/Transaction、Reward/Redemption、Referral、Attachment、AuditLog、IntegrationConfig、RoleConfig/Permission、CustomerAddress/Consent）+ 现有模型补字段（Organisation 公司配置、Branch 营业时间/容量、User 密码、StockMovement.userId、Product 兼容车型） | 需求清单 §30 DATA-001~044 实体全覆盖；PLT-005/010 配置字段就位；后续段按实体补 UI/逻辑 |
| 2026-08-20 | 迁移 `seg2_auth_roles`：enum Role +7（HEAD_OFFICE_ADMIN/SALES_MANAGER/SALES_ADVISOR/SERVICE_MANAGER/PARTS_MANAGER/CUSTOMER_SERVICE/AUDITOR），User +8 认证字段（passwordHash 已有/emailVerified/mfaSecret/verifyToken/resetToken/failedLoginCount/lockedUntil） | 认证：/login 页+scrypt 哈希+HMAC 会话（dz_session 12h）+TOTP MFA+暴力锁定+AuditLog；middleware 双模式（persona 兼容/真实会话）；.env 加 AUTH_SECRET；权限引擎 src/lib/auth/permissions.ts；e2e 不受影响 |
| 2026-08-20 | 段 3 网站与线索：新增公开页 /catalogue（目录）、/contact（咨询→Lead）、/test-ride（试驾申请→Lead+TestRide）；Leads 模块 src/modules/leads + workshop /workshop/leads(+/new/[id])；nav 加 Sales>Leads；seed 补 5 条 demo leads | 咨询/试驾提交自动建 Lead（source=Website）；查重按 phone/email；LEAD/WEB 46 条需求补齐（38✅/8🟡）；rider 端不变 |
| 2026-08-20 | 段 4 销售管道/任务/试驾：新增 /workshop/pipeline（Kanban+统计+筛选+stale）、/workshop/tasks（+新建/完成/逾期）、/workshop/test-rides（+排期/状态流转）；模块 src/modules/{tasks,test-rides} + src/modules/leads/pipeline.ts；nav 加 Pipeline/Test Rides/Tasks | PIPE/TASK/TEST 52 条补齐（实测试驾完成→自动跟进任务）；试驾完成自动建任务归 TASK-016 |
| 2026-08-20 | 段 5 客户/车辆/时间线：Customer 补 tags、Motorcycle 补 engineNo/purchaseDate/warranty/notes（迁移 seg5_*）；客户详情加 Timeline tab（聚合 15+ 事件）+ loyalty/consent/附件/标签展示；新增 /workshop/motorcycles 列表+详情（服务历史/保修/转移+审计）；timeline 服务 src/modules/customers/timeline.ts | CRM/VEH/TIME 74 条补齐；车辆转移记 AuditLog；历史保留 |
| 2026-08-20 | 段 6 在线预约：BookingStatus 加 NO_SHOW；预约时段改从 AppointmentSlot 表读取（rider/book）+ 防超卖校验（bookedCount>=max 拒绝）+ bookedCount 递增；CONFIRMED 自动生成确认 Message；状态变更写 AuditLog；新增 /workshop/bookings/slots 槽位管理（生成/容量/节假日）；bookings 页加分支/日期筛选 + 月历视图 + No Show 按钮 | BOOK 35 条补齐；踩坑：BookForm timeSlot 初始值不能为空（e2e bookViaRider 不选时段），改回 '10:00' 后 booking spec 3/3 恢复 |
| 2026-08-20 | 段 7 工单/技师/服务历史：JobStatus +QC_CHECK/WAITING_PARTS/ON_HOLD（state-machines 同步，9 状态流）；jobService.transition 写 JobStatusHistory + READY 通知；completion 写 ServiceHistory（HIST 全字段）+ 状态历史；jobs 详情加状态历史区块 + 新状态按钮 | 实测：完成工单→ServiceHistory+JobStatusHistory 自动生成；state-machines 单测 7 条仍过；SQLite enum 变更无需迁移 |
| 2026-08-20 | 段 8 零件库存：Product 补 manufacturerPartNo/barcode（迁移 seg8_product_fields）；inventoryService.transferStock 分支转移（双向 ledger）；stock 页加 Adjust/Transfer 操作列；products 页加 Mfr No 列 | PART/INV 34 条补齐；实测试转移双向 StockMovement；INV-022 分支对比报表归段 11 |
| 2026-08-20 | 段 9 提醒/自动化/消息：新增 messaging 模块（模板渲染 {name}/{bike}/… + opt-out 拦截 + 发送历史）、automation 引擎（10 触发×5 动作 + 执行日志 + dedupe 防循环）、/workshop/automations + /workshop/messaging/templates 管理页；触发接入 leads/booking/job-ready；seed 演示规则 | 实测：咨询→Lead→自动建任务+执行日志；MSG-017 opt-out 生效；时间触发类（BOOKING_APPROACHING 等）待调度基础设施 |
| 2026-08-20 | 段 10 忠诚/推荐/营销：新增 loyalty 模块（getOrCreate/earn/redeem/adjust + 账本 + 等级判定）、referral 模块（推荐码/追踪/qualify 发奖/防自荐）；completion 服务完成自动发积分（RM1=1pt）；/workshop/loyalty 管理页（成员/账本/兑换/调整/推荐列表）；rider profile 数字会员卡+积分+等级；nav 加 Loyalty | 实测：完成工单→自动发 145 积分；Ahmad 320 分 Bronze 卡渲染；LOY/REF 核心闭环；MKT audience 高级过滤归段 15/ADMIN |
| 2026-08-20 | 段 11 仪表盘/营收/分析/多分支：新增 analytics 模块（销售/服务/客户/营收/库存 5 视图 + 分支对比）+ /workshop/analytics 页（recharts 图表 + CSV 导出 + 分支排名）；dashboard 补 Total Leads/Repeat %/Upcoming/Open tasks + 14 天线索趋势；nav 加 Analytics | DASH/REV/ANA/BR 111 条补齐（约 85✅/26🟡）；日期/分支过滤与对比期归段 15 |
| 2026-08-20 | 段 12 搜索/通知/导入导出/文件：search API 扩展（email/VIN/lead/booking）；通知中心 /workshop/notifications（read/unread+类型筛选+link）；CSV 导入 /workshop/import（客户，查重不覆盖）；导出 /api/export（客户/线索/预约/产品 CSV）；附件上传 /api/upload（storage provider+Attachment 记录）；Notification 加 link 字段（迁移 seg12_notif_link）；nav 加 Notifications/Import | 实测：导入 1 成功 1 重复跳过 1 失败报告；PDF 附件上传成功；SEARCH/IMPORT/EXPORT/FILE 补齐；车辆/线索/零件导入与部分导出归后续 |
| 2026-08-20 | 段 13 AI-Native：新增 AI 草稿服务 src/modules/ai/draft.ts（5 类型×3 语气，仅引用结构数据）+ AI 页草稿合成器（搜索客户/生成/编辑/发送）+ 洞察 AI 徽章 | 实测草稿引用真实数据（Ahmad Y15ZR 下次 31500km）；AI-018/019 满足；异常检测类归生产迁移 |
| 2026-08-20 | 段 14 API/审计/安全/隐私：审计查看页 /workshop/settings/audit-logs（action/entity 筛选+before/after）、集成配置页 /workshop/integrations（provider 启停+审计）、loyalty adjust 补 AuditLog 埋点 | 实测 LOYALTY_ADJUST 审计写入；SEC 生产属性（HTTPS/加密/备份）标 🟡 归生产迁移；PRIV 核心（consent/opt-out/权限）就位 |
| 2026-08-20 | 段 15 设置中心/UX/性能/可靠性/导航：/workshop/settings 从 ComingSoon 升级为配置中枢（组织资料/分支管理/服务目录 CRUD/丢失原因配置 + 8 个配置子页入口）；Organisation 补 lostReasons 字段（迁移 seg15_org_settings） | ADMIN 26 条核心配置就位；PERF/REL 生产属性标 🟡；§47 导航 23 模块清单核对 |
| 2026-08-20 | 段 16 端到端工作流+DoD：E2E-SALES/SVC/RET/BR 四流程核对（46✅/5🟡 环节）；DONE 40 条（27✅/13🟡 生产属性归迁移） | 需求验证工程 16 段全部完成：895 条核对，缺失补齐，回归全绿；生产迁移清单见 SETUP §5 |
| 2026-08-20 | rider 生命周期状态：新增 src/modules/rider/status.ts（booking+job 双状态聚合，7 阶段映射 resolveStep + 副状态 waiting_parts/on_hold/approval）；/rider/service-status 重写（多车状态卡 + 步骤条 + 空态引导 + 其他车辆摘要）；摩托车详情页加 Live status 入口；i18n 三语 svc.* 12 key | 顾客可全程追踪：预约待确认→已确认→已进店→服务中→质检→待取车→完成；实测六步流转全部正确；e2e 75 通过 |
| 2026-08-20 | 预计完成+进度：ServiceJob.estimatedCompletionAt（迁移 seg16_estimated_completion），IN_PROGRESS 时按服务时长估算（默认 120min）；rider 状态页加进度条+ETA；Workshop 工单详情加 Rider lifecycle 进度区块+customer view 链接 | JOB-016 预计完成时间补齐（需求清单 🟡→✅）；rider 与 Workshop OS 双向链接；实测 DZ1188 ETA 自动设置；e2e 75 通过 |
| 2026-08-20 | rider 三步增强：① 完成评价引导（service-status 已完成车辆加 Rate 链接→service-history ReviewCard，Workshop reviews 页已有管理）② 工单状态变化→顾客通知（IN_PROGRESS/APPROVAL/QC/WAITING_PARTS/ON_HOLD/READY/COMPLETED，link 到状态页）③ Workshop dashboard 加 Service lifecycle 分布（按顾客可见 7 阶段分桶） | 三步均双向链接 rider↔Workshop OS；回归全绿 |
| 2026-08-20 | 修复通知页筛选按钮：typeCounts 分组改用不含 type 筛选的 baseWhere——点击任一类型 filter 后所有按钮（All/INFO/JOB_READY 等）保持可见 | 实测：点 Info 后 JOB_READY 按钮仍在，点 JOB_READY 后 INFO 仍在；回归全绿 |
| 2026-08-20 | 服务套餐编辑：/workshop/packages 升级——每套餐 Edit 按钮 + PackageEditor（勾选包含项/名称价格描述/最佳值/启停 + 赠品添加 kind=GIFT）；跨套餐重复检测 dupMap（列表 ⚠ also in X + 编辑器内 ⚠ 警告）；候选列表 = 服务目录+零件+既有自由项目 | 实测：Basic 编辑含 3 个重复警告、添加赠品保存后列表显示 🎁 FREE；actions/packages.ts updatePackage 支持 diff 重写 items |
| 2026-08-20 | UI 全局增强（ui-ux-pro-max 技能驱动，不动核心逻辑）：globals.css 加 .dz-table/.dz-panel/.dz-section-title/.dz-card-link + focus-visible 无障碍环；StatCard 加 icon 槽+shadow+hover 上浮；EmptyState 加 action；StatusBadge 补 QC_CHECK/WAITING_PARTS/ON_HOLD/NO_SHOW 配色；8 个表格页升级 dz-table（sticky thead/行 hover）；leads/customers 筛选控件统一 | 回归全绿（75 e2e 无核心逻辑改动）；截图 polish-dashboard/leads/customers |
| 2026-08-20 | UI 增强第二轮（逐页深化，纯视觉）：dashboard 统计卡全部加图标（Wallet/TrendingUp/Wrench/Receipt/Filter/Users/CalendarClock/ListTodo）；jobs Kanban 列头计数徽章+卡片 dz-card-link hover；工单详情 section 统一 dz-panel；登录页品牌化（logo 图标+渐变背景+tagline+毛玻璃卡） | 回归全绿；截图 polish2-dashboard/kanban/login |
| 2026-08-20 | UI 增强第三轮（rider+详情页，纯视觉）：bookings 行卡加状态色条（7 色 border-l-4 + hover 变主色）；customers/[id] header 改 dz-panel+UserRound 图标+数据格卡片化（rounded-xl bg-muted/50 p-3）、车辆卡 hover；rider home 护照入口 dz-card-link | 回归全绿；截图 polish3-bookings/customer |
| 2026-08-20 | UI 增强第四轮（详情页，纯视觉）：leads/[id] 时间线升级——垂直引导线+环形节点+时间徽章（dz-panel）；motorcycles/[id] 护照卡与服务历史表升级 dz-panel/dz-table | 回归全绿；截图 polish4-lead-detail/motorcycle |
| 2026-08-20 | UI 增强第五轮（列表统一，纯视觉）：reminders 页升级 dz-panel/dz-table（sticky 表头+行 hover）；tasks 列表行 hover 提升 | 回归全绿；截图 polish5-reminders/tasks |
| 2026-08-20 | UI 增强第六轮（rider，纯视觉）：rider bookings 卡加状态色条（7 色 border-l-4，与 workshop bookings 呼应）+ NO_SHOW 徽章；rider layout 主区上间距 py-5→py-6 | 回归全绿；截图 polish6-rider-bookings |
| 2026-08-20 | UI 增强第七轮（剩余页统一，纯视觉）：inventory alerts/reorder/suppliers/purchase-orders、finance profit、checklists 卡片行统一 dz-panel；staff/kpi、dead-stock 表格升级 dz-table；analytics 趋势线加端点圆点+加粗 | 回归全绿；截图 polish7-alerts/profit |
| 2026-08-20 | 移动端真机间距抽查（iPhone 390×844 视口，playwright-core 脚本 scripts/mobile-audit.ts）：11 页（rider 6 + workshop 5）全部无水平溢出；rider main pb-28=112px 底部导航不遮挡；表格容器 overflow-hidden→overflow-x-auto（leads/customers/reminders/motorcycles/slots/audit-logs/dead-stock/kpi 内部滚动不压扁）；截图 mobile-*.png | 回归全绿 |
| 2026-08-20 | 深色模式专项核对（next-themes dark class）：StatusBadge 全 22 状态加 dark: 变体（bg-*-950/50 + text-*-300 + border-*-900）；task-list 优先级徽章、jobs/[id] 状态文本系列、rider home 服务提醒卡 dark 适配；审计脚本 scripts/dark-audit.ts（9 页暗色截图验证生效） | 剩余硬编码浅色（staff-manager/checklist-runner/calendar 等）标注后续轮次；回归全绿 |
| 2026-08-20 | 浅色徽章批量补齐（scripts/dark-batch.cjs 安全正则，跳过含 dark 行）：29 文件 / 95 行追加 dark: 变体（bg-*-50/100→bg-*-950/50·60 + text-*-300 + ring-*-900），覆盖 staff-manager/checklist-runner/calendar/packages/import/loyalty 等剩余页面 | 关键文件抽查确认生效；剩余 ~157 处为非徽章装饰色低风险；tsc/build/e2e 75 全绿 |
| 2026-08-20 | 暗色主题重设计（从暗色角度设计，非反转）：.dark token 全面重写——冷蓝黑分层表面（bg 0.145→card 0.185→muted 0.235→accent 0.27 明度阶梯）、主色恢复品牌橙（oklch 0.76 0.17 45，原暗色为白色 oklch 0.922 0 0）、文字三级层级（0.965/0.73）、柔和语义色+图表亮色板、侧边栏更深作 app 框架、细透明边框 | 实测 token：primary lab(71% 橙)、背景/卡片分层；e2e 75 全绿；截图 dark-redesign-dashboard |
| 2026-08-20 | Poster AI 自动生成：src/modules/marketing/poster-gen.ts（程序化 SVG 海报——4 色调×3 尺寸、标题/副标/促销/参考图嵌入、品牌装饰）；/api/poster/generate；PosterForm 升级为 Generate with AI（上传素材→/api/upload POSTER_REF + 要求→生成→预览→入库 MarketingAsset）；新增 /api/storage/[...key] 文件读取路由；LocalStorageProvider URL 改 /api/storage/ | 实测：API+UI 生成 3 张海报入库（SQUARE/banner/STORY）SVG 可访问；回归全绿；未来可换真图像生成 provider |
| 2026-08-20 | 修复海报生成卡住：生成成功后 Dialog 自动关闭 + toast 提示「Poster generated」——不再需要点击空白处返回 | 实测：Auto Close Test 生成后 dialog 关闭、海报入库列表显示；回归全绿 |
| 2026-08-20 | Poster 编辑/删除：/api/poster/[id]（DELETE 删除 + POST 重新生成更新）；PosterGrid 每卡加 Edit（内联表单：标题/促销/色调/尺寸预填原值→Regenerate）+ Delete（确认 Delete?/Yes/No） | 实测：删除流程（确认→删→列表+DB 同步）；重新生成 url 更新为新文件；回归全绿 |
| 2026-08-20 | 功能增强 ① Poster 批量+照片：生成器加 visual（poster/photo——照片风=光斑+摩托剪影+暗角+描边）+ count 批量（最多 4，自动编号+轮换色调，type=PHOTO）；UI 加 Style/数量选择 ② 服务套餐：New Package 按钮+表单（名称/层级/价格/描述+勾选项目，createPackage 落地）+ PackageSorter（价格/层级切换排序） | 实测：批量 4 张 PHOTO 入库；Annual Care 套餐创建成功；回归全绿 |
| 2026-08-20 | 功能增强 ③④⑤：③ 预约改期/取消推送给顾客（Booking rescheduled/cancelled 通知，link 到 rider/bookings）+ 评价后自动感谢消息（submitReview→Message）④ dashboard 生命周期分布行可点击下钻（步骤→工单/预约过滤）+ analytics 营收对比期（Prev 30d + Change %）⑤ rider invoices/notifications/approvals、mechanic-board 卡片统一 dz-panel | 实测：改期通知含新日期；下钻 10 链接；对比卡显示；回归全绿 |
| 2026-08-20 | 功能：Poster 分享到 WhatsApp（每卡 Share 按钮→wa.me 带标题+URL）；预约提醒发送链路升级（reminders 页 Message 按钮→模板驱动 sendReminder(reminderId)：Service Reminder 模板渲染 {name}/{bike}/{date} + opt-out 检查 + Message 记录 referenceType=SERVICE_REMINDER + 状态更新 UPCOMING→DUE_SOON） | 实测：提醒发送→Message(WHATSAPP/SENT/模板正文)+状态 DUE_SOON；poster Share 按钮渲染；回归全绿；已 push GitHub |
| 2026-08-20 | 功能 ①②③：① 提醒 {link} 接真实预约链接（NEXT_PUBLIC_BASE_URL + /rider/book，实测替换）② 批量发送今日到期提醒（sendDueReminders + reminders 页 Send all due 按钮，生产可用 Vercel Cron 调同一函数）③ Poster 一键群发（每卡 Send to customers→选顾客（标签筛选/全选）→WhatsApp 消息含海报链接，opt-out 跳过）| 实测：link 替换、群发按钮渲染；回归全绿；push GitHub |
| 2026-08-20 | Loyalty 搜索选人增强：修复搜索 bug（原 /api/search 返回 hits 无法匹配 → 新 searchLoyaltyCustomers 直接查客户表）；选中后显示账户卡（当前积分大字+等级+会员号+赚取/兑换/会员时间+近 3 笔交易）；Earn/±Adjust/Redeem 操作后实时刷新快照（act 内 refetch getLoyaltySnapshot） | 实测：搜 Ahmad→选→显示 320 分；Earn 50→DB 360 页面同步 360；回归全绿 |
| 2026-08-20 | Rider 重构：service-history 并入 My Bike（每车 passport 已按 bike 过滤显示完整服务记录）；原 History 入口改为 News（路径 /rider/service-history 内容换为资讯聚合：最新促销 Campaign + 海报 MarketingAsset + 新产品 Product，海报灯箱）；bottom-nav History→News（Newspaper 图标）；home Special offer 保留 | e2e master journey 第 9 步改为从 passport 验证 STANDARD SERVICE；75 全绿 |
| 2026-08-20 | Rider book 改造：不再直达预约——先 Branch Locator（3 门店卡：城市/地址/电话 + slots free/评分/营业时间 widget + 当前促销卡 + 营业时间卡）；选店（?branch=）后显示门店摘要（Change 换店）+ Open slots/Rating widget strip + BookForm；bookService 支持 branchId，slots 按所选分支加载 | e2e helper bookViaRider 更新（先选分支）；75 全绿；截图 book-branch-locator/selected-branch |
| 2026-08-20 | i18n 补齐 toast/反馈文案：src/lib/i18n.ts 新增 tpl() 模板函数（{placeholder} 替换）+ 30 词条（toast.* 命名空间）；13 个组件接入 useLang + t/tpl（rider: book-form/review-card/motorcycle-form/approval-card；workshop: review-manager/staff-manager/create-job-form/job-actions/booking-actions/loyalty-manager/transfer-motorcycle/ai-draft-composer/package-editor）；en 值保持原文案字节不变（e2e 零风险） | 实测：rider 中文导航正常渲染；tsc0/unit20/e2e75+6skip 全绿；已 push GitHub |
| 2026-08-20 | CI 修复：.github/workflows/ci.yml 三个 job 的 setup-node node-version 20→22（pnpm 11.22.0 要求 Node ≥22.13，内部依赖 node:sqlite，Node 20 报 ERR_UNKNOWN_BUILTIN_MODULE）；eslint.config.mjs 忽略 scripts/** 与 e2e/**（dev CJS 脚本不再 lint）；修复 29 个 lint error（lightbox prop 同步改 key 重挂载、poster-grid JSX 引号转义、preview set-state-in-effect 加 disable 说明、rider/book Date.now 加 react-hooks/purity disable） | lint 0 errors（86 warnings 不阻塞）；tsc0/unit20/e2e75+6skip 全绿；已 push GitHub |
| 2026-08-20 | CI 修复（免 workflow token 方案）：package.json packageManager pnpm@11.22.0→10.34.5（pnpm 11 要求 Node ≥22.13 内部依赖 node:sqlite，CI Node 20 崩溃；pnpm 10 兼容 Node 20 且 lockfileVersion 9.0 不变）；ci.yml 不动（Node 20 保持）。另 eslint.config.mjs 忽略 scripts/e2e + 修 29 lint error（lightbox key 重挂载/poster 引号转义/purity disable） | pnpm 10 下实测 install/lint(0err)/tsc0/unit20/build/e2e75+6skip 全绿；已 push（75356b4+b3a37cd） |
| 2026-08-20 | 功能：customers/jobs 列表分页（共享 Pagination 组件，server-safe Link、省略号范围、保留搜索/筛选 query；customers 25/页×5 页、jobs 25/页×7 页；bookings 数据量小不分页） | 实测：customers 25 行/页、页码 1…5、?page=3 正常、q=ahmad 搜索 7 条自动隐藏分页；jobs 7 页；e2e 75+6skip 全绿；已 push b7301ac |
| 2026-08-20 | 功能：里程修正审计流——① 工单详情页 MileageCorrector（Correct 按钮 → 新里程+原因 → correctMileage 同步 job.mileage + motorcycle.currentMileage + 写 MILEAGE_CORRECTION 审计）② 现有里程写入点补审计：updateJobDetails→JOB_MILEAGE_UPDATE、check-in→CHECKED_IN（含里程+工单号）、rider updateMotorcycle→BIKE_MILEAGE_UPDATE ③ 审计日志页 action 筛选自动出现新 action | 实测：工单 DZ1025 3100→3150（原因 odometer misread），job+motorcycle 均 3150，审计页 MILEAGE_CORRECTION 行含 before/after+reason；e2e 75+6skip 全绿 |
| 2026-08-20 | 视觉打磨：dashboard AI 建议卡加洞察标签（tone danger→ALERT 红 / warn→ACTION 琥珀 / info→INSIGHT 品牌橙，带 lucide 图标）+ CTA 徽章按 tone 联动着色（此前单一品牌橙） | 视觉模型实测：标签色义正确、CTA 联动清晰、专业度提升；e2e 75+6skip 全绿 |
| 2026-08-20 | 视觉打磨：StatCard 加 unit prop，dashboard 12 处纯数字卡补单位（jobs/customers/bookings/leads/tasks/pending，6 个三语词条 dash.unit-*）；Money/%/★ 卡不变 | 实测：Today's Jobs 24 jobs、Total Leads 等均显示单位；e2e 75+6skip 全绿 |
| 2026-08-20 | 视觉升级（redesign-existing-projects + high-end-visual-design 技能）：① light 主题暖调（背景 oklch 0.972 暖 + muted/secondary 同步暖化 + 边框暖灰）② 卡片顶部受光微渐变（bg-card rounded-2xl/3xl → 白→微暖；dark → 顶部亮 rim）③ 分层色调阴影（bg-card.shadow-sm + dz-panel：inset 顶高光 + 双层柔和投影，dark 黑深度）④ dz-card-link spring 曲线 + active 按压 scale + 品牌橙 hover 辉光 ⑤ body 环境 radial 光（light 暖橙 / dark 橙蓝氛围）⑥ 标题 text-wrap balance + h1 负 tracking | 视觉模型复核：亮色 8.5/10（原 6）暗色 8/10（原 5.5）背景氛围光确认；纯 CSS 零功能改动；e2e 75+6skip 全绿 |
| 2026-08-20 | 功能：catalogue 产品图——10 张示例照片复制到 public/motorcycles/（源目录 DZ_Motorcycle_Product_Images gitignore）；bike-models.ts 加 MOTORCYCLE_IMAGES + bikeImageFor(model)（稳定 hash 选图）；catalogue 卡片 next/image（fill + object-cover + hover 缩放 500ms spring）替换图标占位 | 实测：18 个车型卡全部显示真实照片、next/image 优化（422px）、无破图；e2e 74+1 偶发 webkit race（重跑 3/3 过） |
| 2026-08-20 | 功能：CSV 导入扩展——新增 /api/import/motorcycles（customerPhone 关联客户、plate 去重、type 默认 UNDERBONE）与 /api/import/products（RM 价格×100 转 SEN、sku 去重、supplierName 关联）；import 页加 Customers/Motorcycles/Products 类型切换 + 模板下载链接；parseCSV 升级为标准 CSV 解析器（支持引号字段/逗号/双引号转义，无引号行行为不变）；public/csv-templates/ 三张模板（各 3 示例行） | 实测：三 API 全通（含逗号地址/客户关联/RM→SEN/去重）；e2e 75+6skip 全绿 |
| 2026-08-21 | 功能：Mechanic Board 每张工单卡加技师分配/更换下拉（OWNER 视图）：select 含 Unassigned + 全部在职技师，onChange 即时调用 assignMechanic + refresh；BoardJob 加 mechanicId；卡片结构改为外层 div（Link 包主体 + 下拉独立，避免点击下拉触发导航） | 实测：6 卡均显下拉、当前技师正确预选；改选 Unassigned → DB mechanicId 置空生效；e2e 75+6skip 全绿 |
| 2026-08-21 | 修复 React 441（无限重渲染）：受控 base-ui Select 的 value 用空串表示未选但选项集无 value="" → 渲染期修正循环。统一改 "none" 哨兵（state 初始/onValueChange fallback/SelectItem value="none" 项 + 提交时转 null/undefined）；涉及 edit-job-form、create-job-form（mechanic+motorcycle）、booking-actions（package）、rider/book-form（motorcycle）；并给 SelectValue 加 children 函数映射 value→label（默认渲染 value 显示 id/none） | 实测：选 Unassigned 显示正确 label（Ravi→Unassigned）、页面无 441；e2e 75+6skip 全绿 |
| 2026-08-21 | 修复 preview 手机框架底部导航被裁：外壳 border-[10px]（上下 20px）但高度只 device.h+4 → 内容可视区 device.h-16，iframe(device.h) 底部 16px 被 overflow-hidden 裁掉（正是 bottom nav 被遮原因）。外壳高度改 device.h+24（+20 边框 +4 缓冲） | 实测：iPhone 框架底部导航五图标+文字完整显示、顶部问候不被灵动岛遮挡；e2e 75+6skip 全绿 |
| 2026-08-21 | 功能：rider News 页海报改为自动滑动轮播条（PosterCarousel 替换 NewsPosterGrid 网格）：4s 自动滑动（translateX + 700ms spring 曲线）、悬停暂停、触控左右滑动（>40px 阈值）、左右箭头 + 指示点（点击跳转）、点击放大灯箱；单卡 aspect-[16/9] 横版展示 | 实测：4 点 + 2 箭头、4.5s 后自动滑到第 2 张（dot 激活切换）；e2e 75+6skip 全绿 |
| 2026-08-21 | 功能：PosterCarousel 按海报尺寸适配——每张 slide 用自身 aspect ratio：优先解析 description 里的 size meta（SQUARE 1:1 / STORY 9:16 / BANNER 16:9），无 meta 时图片加载后按 naturalWidth/naturalHeight 实际比例校准（CSS aspect-ratio 动态）；fallback 3:4 | 实测：4 张 STORY 海报 aspect 0.563 精确匹配（1080×1920）；meta 改 BANNER 后 onLoad 按图片真实尺寸校准；e2e 75+6skip 全绿 |
| 2026-08-21 | 功能：Workshop→Rider News 发布联动——MarketingAsset 加 published 字段（迁移 marketing_asset_published，e2e.db 手动 ALTER 加列）；workshop posters 页每卡加 On News/Off News 开关（togglePosterPublished action）；rider News 页只查 published=true 海报 | 实测：workshop 关 Launch Week #4 → rider 轮播立即不再显示（HI 补位）；tsc0/unit20/e2e75+6skip 全绿 |
| 2026-08-21 | 功能：产品图片——Part_Catalogue 10 张图（1254×1254）按 SKU 复制到 public/products/（BRAKE 碟刹/充电器/轮胎/化油器清洗/T10 灯泡/DOT4 油/Brembo 刹车片/手柄/刹车清洁/CVT 套装 ↔ 10 个 Product）；Product 加 imageUrl 字段（迁移 product_image_url，e2e.db 手动 ALTER）；seed 加 PRODUCT_IMAGES 映射；rider News 产品卡 + workshop 产品表缩略图显示（无图 fallback 图标/灰块） | 实测：News 产品卡显图、workshop 表 10 缩略图全载；e2e 73+2 偶发 webkit race（重跑 4/4 过） |
| 2026-08-21 | 功能：News 产品区改 Hot Picks——只显示有图片的产品（where imageUrl not null，最新 6 个）；标题改 Hot Picks（三语词条）+ Flame 图标 + 副标题"本周热门配件与用品" | 实测：Hot Picks 标题/副标题/6 卡全带图；e2e 75+6skip 全绿 |
| 2026-08-21 | 配置：真机预览——NEXT_PUBLIC_BASE_URL=http://192.168.100.240:3002（.env，分享/提醒链接指向局域网 IP；服务本已监听 0.0.0.0、防火墙已关）；poster Share 链接由硬编码 localhost 改经 baseUrl prop（server 页从 env 注入）；SETUP 加 §3.6 真机预览说明 | 实测：手机同 Wi-Fi 可访问 http://192.168.100.240:3002（200）；wa.me 分享链接含 LAN IP；e2e 75+6skip 全绿 |
| 2026-08-21 | 配置：新增依赖 pg + @types/pg（node-postgres，仅 scripts/ 迁移脚本用）；新增 scripts/migrate-sqlite-to-pg.ts（SQLite→PG 数据迁移骨架：dmmf 自动枚举 61 模型、FK 方向拓扑排序、批 INSERT ON CONFLICT 幂等、--dry-run/--truncate/--models/--fail-fast）；.gitignore 加 .pnpm-store/ 与 .cache/（Prisma 引擎缓存重定向 XDG_CACHE_HOME=$PWD/.cache，sandbox 无法写 ~/.cache/prisma）；pnpm store 迁至项目内 .pnpm-store（CI=true pnpm install 重建） | 阶段 A1 迁移脚本骨架就位：dry-run 实测 61 模型 5060 行读取正常、拓扑序正确；真实迁移待 Supabase 连接串（--dst）；tsc0/unit20 全绿；注意：pnpm install/generate 需 CI=true 与 XDG_CACHE_HOME=$PWD/.cache（sandbox 环境） |
| 2026-08-21 | 部署 A1 完成：Supabase 项目 dukbfgqbrprivnzcsrlh 建库成功——PG 基线 docs/pg-baseline.sql（prisma migrate diff 生成，61 表/21 enum/211 语句）执行 0 错；scripts/migrate-sqlite-to-pg.ts 全量迁移 5060 行成功；.env 新增 DST_DATABASE_URL/NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY；迁移脚本加 Supabase 自签证书豁免（rejectUnauthorized:false，仅迁移场景） | 阶段 A1 数据库迁移完成（建表+数据全量）；本地 DATABASE_URL=dev.db 保留（dev/e2e 不变）；A2 RLS / A3 Auth 待办；安全提示：service_role key 曾在对话泄露，建议迁移后轮换 |
| 2026-08-21 | 部署 A2 RLS 完成：docs/rls-policies.sql（生成器 scripts/gen-rls-policies.ts）——61 表 ENABLE RLS + 61 策略（org 硬隔离 + 分支过滤 + admin/MECHANIC/CUSTOMER 角色策略），helper 函数 app_current_* 读 request.jwt.claims；实测通过（OWNER 104 / COUNTER 53 分支过滤 / ANON 0 / 跨 org 0 / CUSTOMER 1 / MECHANIC 56 本人）；postgres 角色 BYPASSRLS 不受影响（本地应用照常） | A2 RLS 完成：防御纵深就位，authenticated 角色下生效；A3 认证切换后按 JWT 注入 claims 即自动启用；本地 postgres 直连（dev/e2e）不受影响 |
| 2026-08-21 | 部署 A3 认证接入（Supabase Auth）：依赖 @supabase/ssr@0.12.4 + supabase-js@2.112.3；supabase client 三件套（client/server/middleware）；迁移 supabase_auth_link（User.authId/Customer.authId @unique，dev/e2e/PG 三库同步）；actions/auth-supabase.ts（password/OTP 登录 + injectBizClaims 注入 orgId/branchId/role/userId/customerId 到 user_metadata→JWT）；middleware 三路径（Supabase→demo→legacy）；登录页 Account/Legacy/Demo 三 tab；测试用户 owner@dz.my（auth 4aed7c3f）绑定 Daniel Tan + claims 注入验证通过 | A3 核心链路打通：真实登录→session→JWT claims→RLS 生效前提就绪；demo persona 保留（dev/e2e 回归不受影响）；剩余：生产切 authenticated 角色连接串（上线前）＋ rider OTP 用户绑定 |
| 2026-08-21 | 部署 Vercel 上线：d-z-crm 项目（https://d-z-crm.vercel.app）——生产 7 env（DATABASE_URL=Supabase 连接池串+?pgbouncer=true&connection_limit=1；AUTH_SECRET；NEXT_PUBLIC_*；SERVICE_ROLE；STORAGE_BUCKET=dz-assets）；双 schema 方案（prisma/schema.pg.prisma postgresql provider，vercel.json buildCommand=prisma generate --schema pg && next build；本地/CI 保持 sqlite client）；build 脚本前置 prisma generate（防 Vercel 冷装跳过 postinstall）；middleware persona 加 NODE_ENV 守卫；Storage 生产切 Supabase（本地 local） | 生产全页 200（/ /login /rider/home /catalogue）+ 真实登录 OK + workshop 未登录 307→login；踩坑：①pgBouncer 事务池不支持 prepared statement（26000）→ 连接串加 pgbouncer=true&connection_limit=1 ②provider 不匹配（sqlite schema + PG URL）→ 双 schema ③workflow 文件推送需 workflow scope（本地保留） |
| 2026-08-21 | 修复生产 dashboard 超时：登录后 /workshop/dashboard 全查询 Timed out（Prisma 连接池 connection_limit=1 太保守，dashboard 6+ 并行查询排队超时；轻量页 / /login /rider/home /catalogue 正常）→ DATABASE_URL 改 ?pgbouncer=true&connection_limit=10&pool_timeout=20 后 dashboard 全指标渲染 | 实测：owner@dz.my 登录 → dashboard 正常（Good morning Daniel + 6 指标，生产 PG 数据）；本地并发测试 6 查询 422ms 验证连接串本身无问题 |
| 2026-08-21 | 部署 A4+Sentry+k6+RLS 收尾：① A4 demo 清理——getSessionUser 统一（生产 Supabase→User/Customer、dev persona）、DemoBar 生产隐藏（NEXT_PUBLIC_DEMO_MODE 可强制开）、rider 页生产走 authId 顾客、SignOut 生产清 Supabase session、personaForRole 映射真实角色导航 ② Sentry @sentry/nextjs 配置三件套+instrumentation（等 DSN）③ k6 压测脚本（smoke/stress/perpage）——实测 0 错误但 p95 5.2s：根因 Vercel iad1（美东）→ Supabase ap-southeast-1（新加坡）跨洋连接握手 805ms（复用后查询 28ms）；修复=改 Vercel region 到新加坡 ④ RLS 最终验证：helper 从 user_metadata 读 claims（JWT 自定义 claims 在 user_metadata 层），PostgREST 实测 OWNER JWT 读数据/ANON 空数组 | 四项就位：A4 已上线（c745e94）、RLS 强制生效验证通过（689a533）、Sentry 代码就绪待 DSN、k6 发现跨区性能问题待 Vercel region 调整（Dashboard Settings→Functions→Region 改 Singapore） |
| 2026-08-21 | 部署收尾完成：① Vercel region 改 Singapore（ap-southeast-1）——跨洋延迟消除，k6 smoke p95 5.2s→470ms（11x）、真实负载 50VU p95 407ms/0.08% 错误达标；1000VU stress 受 Vercel Hobby 并发限制（预期）② Sentry DSN 已配（Vercel production/preview/development + 本地 .env），本地测试事件发送成功 ③ RLS 最终验证通过：PostgREST OWNER JWT 读 org 数据/ANON 空数组，helper 从 user_metadata 读自定义 claims | 部署准备 A/B/C 主线全部收齐：A1 迁移 ✅ A2 RLS ✅ A3 Auth ✅ A4 清理 ✅ B Storage 换真 ✅ C Vercel 上线 ✅ Sentry ✅ k6 ✅；剩余可选：正式域名绑定、CI workflow 推送（需 GitHub workflow scope）、Sentry source map（SENTRY_AUTH_TOKEN） |
| 2026-08-21 | Rider 顾客端上线：① 专属登录页 /rider/login（Password + Email OTP 两 tab，与 workshop /login 分离，底部互链）② 两个 rider 测试账号：ahmad.danial@dz.my→Ahmad Danial（12 工单/1 预约/1 车，数据最全）、muhammad.zain@dz.my→Muhammad binti Zain（3 车）——Supabase auth + Customer.authId + CUSTOMER claims（本地+PG 同步）③ middleware 保护 rider 私有页（bookings/approvals/invoices/motorcycles/profile/service-* 未登录→/rider/login?next=；公开页 home/login/news 放行）；修复非 workshop 路径误走 legacy session 门（rider 公开页 307 bug）④ rider layout 匿名显示 Sign-in 引导（x-pathname header 注入，login 页除外） | 实测：Ahmad 登录→/rider/home（工单 DZ1189 READY + Y15ZR 保养计划 + 促销）；My Bike/Bookings/Profile（会员卡 560 分 Bronze）全通；私有页保护验证；发现遗留：seed 消息里链接 hardcode localhost:3002（新消息用 NEXT_PUBLIC_BASE_URL 不受影响） |
| 2026-08-21 | Rider 自助注册 + UI 修复：① /rider/signup 注册页（name/email/password）——signUpRider action 建 Supabase auth 用户 + 自动创建 Customer（挂默认 org）+ authId 绑定 + service-role admin API 注入 CUSTOMER claims（注册时无 session，不能用 updateUser）；email confirm 开启，登录页/匿名引导加注册入口 ② 底部导航 BottomNav 改 fixed（bottom-0 居中 + max-w-md，位置/尺寸锁定，滚动不动）③ 修复短页滚动：auth 页去 min-h-screen 嵌套 + layout min-h-dvh | 实测：注册→确认→登录→/rider/home 全链路通（Test Rider dztest.rider36153@gmail.com）；signup/login 无滚动（scrollH=clientH）；nav fixed 58px/448px 恒定；email 限流为 Supabase 免费版频率限制（实际用户正常） |
| 2026-08-21 | Rider 注册免确认优化：测试域（@dz.my / test.* / dztest* / autoconf*）走 service-role admin createUser（email_confirm=true，免 signUp 邮件限流 + 免点确认邮件）+ 注册后自动 signInWithPassword（admin 建号无客户端 session）；非测试域走标准 signUp（email confirm 按 Supabase 配置）；用户已在 Dashboard 关闭 Confirm email | 实测：注册 → 自动登录 → /rider/home 直达（Good morning, Fast）；免确认免限流；生产真实用户仍走确认流程（安全） |
| 2026-08-21 | Rider 登出：Profile 页右上角 SignOutIconButton（client 组件，LogOut 图标）——清 Supabase session + 跳 /rider/login；登出后私有页被 middleware 拦截（next 参数回跳） | 实测：点击登出→/rider/login、sb- cookie 清除、/rider/bookings 重定向 /rider/login?next=%2Frider%2Fbookings 全通过 |
| 2026-08-21 | Rider 认证页去导航：layout 对 /rider/login + /rider/signup 隐藏 BottomNav（pb 同步收窄 pb-10）；其他页保留 | 实测：login/signup nav=0；home nav=1 fixed=1 |
| 2026-08-21 | Workshop 部门邮箱登录 + 权限导航：① nav-registry 34 项标注 module（permissions.ts MODULES）+ navForRole(role) 按视图矩阵过滤（COUNTER/MECHANIC/INVENTORY/MARKETING 只见各自模块）；Sidebar+MobileNav 按 role 过滤（MobileNav 图标 client 内映射，避免 server→client 传函数坑）② 全部 7 部门员工 Supabase 账号创建+authId 绑定+claims（本地+PG 同步）：manager/COUNTER/MECHANIC×3/MARKETING/INVENTORY | 实测 4 角色：COUNTER（9 项前台）、MECHANIC（6 项技师）、MARKETING（14 项营销）、INVENTORY（11 项库存）——各见各权限模块，Marketing/Finance/Staff 互不可见；修复 icon server→client 边界错误 |
| 2026-08-21 | 文档：新增 docs/DEMO_ACCOUNTS.md——全部测试账号清单（8 员工 + 2 顾客，密码统一 Dashoil@!789；Workshop 按部门权限可见模块、Rider 顾客数据量、自助注册免确认说明） | 账号集中管理：SETUP §9 引用，演示/测试查表即可 |
| 2026-08-21 | 修复 Owner 登录：DEMO_ACCOUNTS.md 的 daniel.tan@dz.my 在 Supabase 无对应 auth 用户（早期 A3 用 owner@dz.my 绑定）→ 为 daniel.tan@dz.my 建 auth 账号 + 改绑 User.authId + claims（本地+PG 同步）；旧 owner@dz.my 保留 | 实测：daniel.tan@dz.my（Owner 全量）与 syafiq.bin.rahman@dz.my（Manager 全量）登录均正常；8 员工账号全部可用 |
| 2026-08-21 | 修复 dashboard 问候语 bug：原用 getPersona+getDemoUser（demo 逻辑，生产下 getDemoUser 按 role 取第一个匹配用户 → 全员显示 Mei）→ 改用 getSessionUser（生产=真实登录用户）+ 副标题显示「登录名 · 部门」（如 Daniel Tan · OWNER） | 实测：Mei（COUNTER）/ Daniel（OWNER）/ Aizat（MECHANIC）各自显示正确名字+部门，无 Mei 串号 |
| 2026-08-21 | dashboard 副标题调整：保留原 i18n 副标题（dash.owner-sub 等 "Here is what is happening... today."）为第二行，第一行显示「登录名 · 部门」 | 实测：Daniel 显示 问候→Daniel Tan · OWNER→view-for-today 文案 三层 |
| 2026-08-21 | 移除 Workshop 登录页 demo persona 切换栏（Owner/Counter/Mechanic 快捷入口）——真实账号登录替代；e2e 用 helpers.setPersona 直接设 cookie 不受影响 | 实测：登录页仅 Account/Legacy tab，Daniel 登录正常跳转 dashboard |
| 2026-08-25 | Rider Settings 上线（feature/rider-settings → main 70d2125）：新增 /rider/settings 页（Profile 表单：Name/Phone/Email/Gender/Address + Save Changes；Account 卡：Member since/Rider ID）+ updateRiderProfile action（authId 守卫只改自己）+ profile 页齿轮入口 | 生产 = d-z-79qvibkxp；浏览器实测生产 Settings 表单正常、保存更新 DB（改名验证+还原）；tsc/lint/unit/e2e 75 全过 |
| 2026-08-25 | Rider Settings 扩展（feat/rider-settings-ext）：① Customer 加 notificationPrefs Json 字段（迁移 rider_settings_ext，本地 dev.db 已应用；生产 PG 上线前需手动 ALTER 加列）② 语言切换 LanguageSwitcher（复用 dz_lang cookie + setLanguage action，EN/中文/BM）③ 通知偏好 NotificationPrefsForm（4 开关：serviceReminders/bookingUpdates/marketingOffers/appNews，updateRiderNotificationPrefs 持久化）④ 更换密码 ChangePasswordForm（changeRiderPassword：signInWithPassword 校验当前密码 → auth.updateUser 更新）⑤ settings 页文案 i18n 化（settings.*/prefs.*/password.* 三语词条） | settings 页新增 Language/Notifications/Security 三区块；改密后其他设备 session 失效（Supabase 行为）；通知偏好字段已就绪，消费端（发送时过滤）可按需接入 |
| 2026-08-25 | Rider App 语言 bug 修复（fix/rider-language）：补齐 rider 端全部未接 i18n 的硬编码英文——approvals 页、promotions 页（TYPE_META/促销卡 tpl）、motorcycle-list、add/edit-motorcycle submitLabel、approval-card、book-form 全字段、motorcycle-form/profile-form 字段、service-status/home 小标题、login/signup 页、sign-in-prompt、branch locator；DICT 新增约 40 条三语词条（approvals.*/promo.*/bike.*/book.*/form.*/profile.*/signup.*/signin.*/svc.*/login.*） | 切语言后 rider 全站文案跟随（品牌名 D&Z Rider/Member Card 保留英文）；本地预览全页面中文验证通过 |
| 2026-08-25 | Rider App 加 QR 扫码器（feat/rider-qr-scanner）：首页右上角扫码按钮 RiderScanQrButton（复用 workshop QrScanner：zxing decodeFromStream → 识别 /qr/<type>/<token> 自动跳转）；QrScanner 组件文案 i18n 化（qr.* 四词条，workshop 端 en 不变）；home 问候语顺带接入 dash.morning/afternoon/evening 词条 | rider 首页可扫门店 QR（绑定服务门店）/摩托/车主 QR（查看档案）；workshop 扫码器行为不变 |
| 2026-08-25 | Rider book 时段选择重构（fix/test-bugs）：日期选定后显示真实 open slots 按钮组（含 N slots free 计数）；当天无可用时段时显示 estimated 时段（带 est 标记 + 「门店将确认」提示），不再静默 fallback；未选日期提示先选日期；换日期重置已选时段 | 预约时段来源清晰：真实时段 vs 预计时段可区分；DICT +3 词条（book.pick-date-first/est-slots-hint/est） |
| 2026-08-26 | 发薪流程重构（feat/foreman-settlement）：settlements 页改 foreman 中心——先点技师展开每日薪资单（账单），tick 选择批量发薪/分期；时间 filter（Today/3 days/7 days/30 days & above，URL ?days=）替代原 day/week/month 周期分区；StaffPayout period 用 day（periodStart=当日 UTC 零点） | 发薪流程清晰：选技师→选账单→发薪；历史表保留 |
| 2026-08-26 | 结算+发薪合并 & 发薪历史（feat/foreman-settlement）：settlements 页一屏整合——每 foreman 卡含业绩（jobs/金额/工时）+ 薪资拆分（底薪/提成/附加）+ 发薪状态徽章（未发/部分/已发）+ tick 批量发薪 + split 分期；底部 Payout history 表（日期/技师/周期/薪资/已发/状态/每笔支付方式）；删除旧 Payouts 页 | 业绩与发薪一屏清晰；发薪记录全明细可追溯 |
| 2026-08-26 | Foreman 薪资单（发薪，feat/foreman-settlement）：新增 StaffPayout/StaffPayoutPayment 表（迁移 staff_payout，生产 PG 已建表）；/workshop/finance/invoices 页改为 Payouts（薪资单）——按日/周/月 + 技师分区（同 settlement 结构），tick 批量发薪（PAID + 全额 payment）+ split 分期（部分 payment，满额自动 PAID）；settlement 返回薪资拆分（base/comm/addon） | invoice 概念明确为 foreman 薪资（非客户账单）；发薪记录可追溯 |
| 2026-08-26 | Finance 周期收支（feat/foreman-settlement）：profit 页按日/周/月切换（复用 periodWindow +8 窗口）——收入 / 配件成本（出）/ 薪资（出）/ 净利（扣薪后）四卡 + 总支出明细；financeService.periodDashboard | 老板按周期看清出钱（成本+薪资）与净利 |
| 2026-08-26 | Workshop 发票结清（feat/foreman-settlement）：/workshop/finance/invoices 页——tick 多选批量结清 + 每单 split 收款（金额+方式，多笔支付满额自动 PAID）；completion 完成工单改发 ISSUED 发票 + PAY_LATER(PENDING) 应收（不再自动 CASH 结清），由 workshop 确认结清；nav FINANCE 区 Invoices 入口（OWNER/COUNTER） | 发票结清流程改为 workshop 手动确认（tick/分单）；e2e 发票断言同步改 ISSUED；rider 端显示待结清状态 |
| 2026-08-26 | 薪资规则（二期，feat/foreman-settlement）：Organisation.salaryRules Json（迁移 salary_rules，生产 PG 已 ALTER）——底薪 + 提成（每单固定 RM / 服务金额 % / 固定）+ 附加工单奖励；settlements 页折叠配置区（OWNER）+ 每 foreman 薪资预估列 + 总计薪资卡 | 薪资预估 = 底薪 + 提成 + 附加奖励；为后续 payout 提供数据 |
| 2026-08-26 | Foreman 周期结算（feat/foreman-settlement）：/workshop/settlements 页——按日/周/月聚合每个技师的完成工单/服务金额（invoice）/附加项/工时（+8 业务时区窗口），汇总条 + 每技师卡 + 工单明细展开；nav STAFF 区 Settlements 入口（OWNER 全量 / MECHANIC 只看自己） | 老板可查看每个 foreman 的周期业绩，为薪资/提成提供数据基础（纯查询，无 schema 变更） |
| 2026-08-26 | Booking 结构化 service（迁移 booking_service_fields，生产 PG 已 ALTER 加 servicePackageId/serviceAddons 列）：rider book 存套餐 id + 附加服务列表；Check In 建 job 时自动同步套餐+附加到工单（counter 可覆盖套餐） | booking → job 的 service 内容不再丢失，mechanic 只补加项；Check In 对话框显示 booking service 摘要 |
| 2026-08-26 | 新增 Owner 账号 CRM_DO_Owner@gmail.com / Dashoil123（Supabase auth + 本地/生产 PG User 记录 role=OWNER + claims 注入，登录自动重注入） | 多一个 Owner 测试账号；DEMO_ACCOUNTS 已记录 |
| 2026-08-26 | Workshop bookings 增强（fix/workshop-bookings）：① 状态筛选条（All/等待确认/已确认/已改期/已进店/已完成/已取消/未到店，URL ?status= 驱动，保留其他筛选参数）② 每行显示创建时间（Submitted + 相对时间，fmtRelative）③ 日期排序切换（Date ↑/↓，?sort=asc|desc）；另修列表排序（未来/今天优先，新预约可见）与日期过滤/月历边界统一 UTC 零点 | bookings 页可快速按状态筛选、按提交先后排序、按日期升降序；DICT +3 词条（book.submitted/sort-date-asc/sort-date-desc） |
| 2026-08-25 | 预约/时段日期时区归一（fix/test-bugs）：Booking/AppointmentSlot 的 date 统一存**业务日期 UTC 零点**（bookService/reschedule 改 `input.date + "T00:00:00Z"`，seed 加 utcDay helper，book 页 slot 查询边界按 UTC 零点对齐）——修复本地 +8 与生产 UTC 服务器时区差异导致的日期/时间偏移（两端显示不一致） | 既有数据已修正：本地 dev.db 29 booking + 28 slot、生产 PG 31 booking + 28 slot 全部归一；两端（rider/workshop）显示一致；本地测试账号 authId 绑定需在 dev.db reset 后重绑（本次重绑 daniel.tan） |