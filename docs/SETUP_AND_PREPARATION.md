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
| — | （后续改动在此追加） | — |
