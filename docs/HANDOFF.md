# HANDOFF — D&Z Platform（2026-08-19 17:31）

> 本文件由 session-pack 生成，session-resume 可续接。Day-1 历史版见 docs/HANDOFF-day1.md。

## 一句话状态
原型功能已齐备且全绿：全模块（workshop/rider/营销闭环）+ 三语言 i18n + 手机预览框架 + 真实海报素材，75/75 Playwright 通过；剩余主线是经销商验证和生产迁移。

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
1. 经销商验证（需真人）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策
2. 生产迁移 §65：Supabase PG+Auth+RLS、provider 换真（WhatsApp/OpenAI/Storage/Payment）、Vercel、Sentry、k6（清单在 SETUP §5）
3. 可选打磨：剩余 i18n（部分 toast/AI 动态文案）、分页、里程修正审计流

## 基线测试（命令 + 期望通过数）
- \`pnpm test\`：20 个通过（money/state-machine/prediction/promo）
- \`pnpm exec playwright test\`：75 passed + 6 skipped（3 浏览器矩阵）
- \`pnpm exec tsc --noEmit\`：0 错误 ｜ \`pnpm build\`：通过

## 服务与恢复
- demo：curl http://localhost:3002 ｜ 挂了：\`launchctl kickstart -k gui/$(id -u)/com.dz-platform.server\`
- e2e：curl http://localhost:3102 ｜ 挂了：\`launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e\`
- ⚠️ 改 src 后必须 build + kickstart 两个服务（testids 在 build 里）；改 schema 后 e2e.db 需 migrate

## git 状态
- 分支：main ｜ 工作树干净（提交 b342d3e 为最新）

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
- 59e04e5e 经销商验证（今日到期）：填 DEALER_FEEDBACK.md + DEMO_SCRIPT 演示 + 6 决策
- 92b29072 生产迁移 §65（q2）：Supabase/Auth/provider/Vercel/Sentry/k6

## 新会话头 10 分钟
1. curl localhost:3002 + :3102 探活（挂了 kickstart）
2. 读 docs/HANDOFF.md + docs/SETUP_AND_PREPARATION.md
3. 跑基线：pnpm test（20）+ pnpm exec playwright test（75）
4. dtodo 挑下一步（经销商验证 → 生产迁移）
