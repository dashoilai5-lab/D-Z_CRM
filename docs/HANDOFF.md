# HANDOFF — D&Z Platform（2026-08-19 17:31，续 2026-08-20）

> 本文件由 session-pack 生成，session-resume 可续接。Day-1 历史版见 docs/HANDOFF-day1.md。

## ⚠️ 2026-08-20 追加：需求验证工程完成（session-3685dd91）

按 docs/D&Z AI CRM — Detailed Product Requirements Checklist.md 的 **895 条编号需求**分 16 段完成验证与补齐（18 提交 / 144 文件 / +10.2k 行）。追踪：docs/REQUIREMENTS_VERIFICATION.md（全段 ✅）。

**新增能力**（段 1-16）：
- 数据模型：+27 实体（Lead/Task/TestRide/Loyalty×5/Referral/Automation/AuditLog/Attachment/Consent/RBAC 等）+ 9 迁移
- 认证：/login + scrypt + HMAC 会话 + TOTP MFA + 锁定 + 16 角色 + RBAC 权限引擎 + middleware 双模式
- 销售：公开网站（目录/咨询/试驾→Lead）、管道 Kanban、任务、试驾生命周期
- 服务：槽位防超卖、9 状态工单机、服务历史、库存转移
- 增长：自动化引擎（10 触发×5 动作）、消息模板、忠诚积分、推荐
- 平台：通知中心、CSV 导入导出、附件、审计页、集成页、分析中枢、设置中枢

**回归**：tsc 0 错 / unit 20 / Playwright 75 passed + 6 skipped（全程保持）。

**剩余主线不变**：① 经销商验证（dtodo 59e04e5e）② 生产迁移 §65（dtodo 92b29072）——生产属性项（真实 provider/HTTPS/备份/索引/限流/PDPA）在 SETUP §5 清单与追踪文档各段 🟡 备注。

## 一句话状态
原型功能齐备且全绿（tsc0/unit20/e2e75+6skip），迭代增强完成：Loading 全链路、UI 去 AI 味与高级感、i18n toast、分页、里程审计流、Mechanic Board 技师下拉、preview 框架修复、海报自动轮播（按尺寸适配）、Workshop→Rider News 发布联动、产品图片（10 SKU）、Hot Picks、真机预览（LAN IP 192.168.100.240）。**已进入部署准备**：DEPLOYMENT_CHECKLIST.md。**A1 数据库迁移完成**（Supabase dukbfgqbrprivnzcsrlh：PG 基线 61 表/21 enum + 数据 5060 行全量，migrate deploy 不可行→diff 基线方案）。**A2 RLS 完成**（61 表 ENABLE RLS + 61 策略 docs/rls-policies.sql，生成器 scripts/gen-rls-policies.ts：org 硬隔离+分支过滤+admin/MECHANIC/CUSTOMER 角色策略，实测全场景通过；authenticated 角色生效、postgres 绕过保本地兼容）。下一步：A3 认证（Supabase Auth 替换 persona + JWT claims 注入 orgId/branchId/role/userId/customerId → RLS 自动启用）。

## 会话信息
- 原会话 ID：session-ec4b081f-efca-4e4f-a187-4302bb0ce385
- 打包时间：2026-08-19 17:31
- 续接口令：继续 D&Z

## 完成进度
- Phase 0-9 全模块：workshop OS（约 30 路由）+ rider app（13 路由）+ 主旅程 E2E
- 营销闭环：活动生命周期/促销转化归因（Booking.campaignId）/WhatsApp 群发/评价运营（采纳+回复）/三视图日历（week/month/year）/campaign 编辑
- 市场数据落地：车型类型（12 类）、服务目录（12 项）、品牌→型号映射（bike-models.ts）
- 部门隔离：Owner 全量 / Counter 11 项 / Mechanic 5 项（nav-registry + middleware URL 拦截 + 数据按 mechanicId 过滤）
- 员工管理：添加/启停员工 → 自动同步看板/分配/KPI
- i18n：en/zh/ms 三语（字典 395+ 词条），覆盖全部页面 + 框架层；e2e 固定 en
- 手机预览框架 /preview：设备外壳（iPhone/Pixel/Compact）+ 页面/语言/角色切换 + 隐藏 demo bar
- 真实海报素材：public/posters/ 10 张接入 seed + 灯箱放大
- rider 预约页重构：套餐单选 + 附加服务多选 + 实时总价
- 基建：docs/SETUP_AND_PREPARATION.md（配置台账，§9 变更日志）

## 下一步（按优先级）
1. **部署准备（主线）**：docs/DEPLOYMENT_CHECKLIST.md——阶段 A（Supabase 项目+migrate deploy+RLS+Auth 替换 persona+demo 清理）/ B（Provider 换真）/ C（Vercel+Sentry+k6+生产功能）
2. 无账号即可做：~~数据迁移脚本骨架~~（✅ 已完成 26906c8：scripts/migrate-sqlite-to-pg.ts，dry-run 实测 61 模型/5060 行，真实迁移待 --dst）、middleware 双模式预研（✅ 已确认实现：middleware.ts 双路径）、DemoBar 生产条件渲染（未做）
3. 经销商验证（需真人）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策

## 基线测试（命令 + 期望通过数）
- \`pnpm test\`：20 个通过（money/state-machine/prediction/promo）
- \`pnpm exec playwright test\`：75 passed + 6 skipped（3 浏览器矩阵）
- \`pnpm exec tsc --noEmit\`：0 错误 ｜ \`pnpm build\`：通过

## 服务与恢复
- demo：curl http://localhost:3002 ｜ 挂了：\`launchctl kickstart -k gui/$(id -u)/com.dz-platform.server\`
- e2e：curl http://localhost:3102 ｜ 挂了：\`launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e\`
- ⚠️ 改 src 后必须 build + kickstart 两个服务（testids 在 build 里）；改 schema 后 e2e.db 需 migrate

## git 状态
- 分支：main ｜ 工作树干净（最新提交 26906c8，feat(migration) 迁移脚本骨架）

## 关键决策与约定
- 端口：D&Z 固定 3002/3102；3000 被 DashOil 抢占勿用
- 每次配置类改动（env/模块/API/迁移/依赖/测试/i18n）→ 更新 docs/SETUP_AND_PREPARATION.md §9
- e2e 测试断言英文文本 → helpers.ts setPersona 固定 dz_lang=en
- 业务代码只依赖 provider 接口（src/providers/types.ts），生产换实现不动业务层

## 踩坑与事实
- sandbox 会 SIGTERM 普通后台进程（exit 143）→ 必须用 launchd 守护
- e2e/global-setup 清库重播种后需重启 e2e 服务（SQLite 句柄过期）
- i18n en 值必须保持原 UI 大小写（CRITICAL/DRAFT），否则 e2e 断言失败
- Lucide icon 组件函数不能从 server 传给 client 组件 → 内部映射
- sticky bottom nav 安全区：padding 放内层 div + env(safe-area-inset-bottom)

## 待办（dtodo）
- 92b29072 生产迁移 §65（q2，主线）：Supabase/Auth/RLS/provider 换真/Vercel/Sentry/k6 —— 行动清单见 DEPLOYMENT_CHECKLIST.md
- 59e04e5e 经销商验证（需真人）：填 DEALER_FEEDBACK.md + DEMO_SCRIPT 演示 + 6 决策

## 新会话头 10 分钟
1. curl localhost:3002 + :3102 探活（挂了 kickstart）；真机预览 IP=192.168.100.240
2. 读 docs/HANDOFF.md + docs/DEPLOYMENT_CHECKLIST.md + docs/SETUP_AND_PREPARATION.md §5
3. 跑基线：pnpm test（20）+ pnpm exec playwright test（75）+ tsc 0
4. dtodo 挑下一步（主线=部署准备阶段 A；或先做无账号三项：迁移脚本/middleware 双模式/DemoBar 条件渲染）
