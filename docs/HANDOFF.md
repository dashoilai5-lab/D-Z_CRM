# HANDOFF — D&Z Platform（2026-09-02 17:3x，session 67081e33）

> 本文件由 session-pack 生成，session-resume 可续接。

## 一句话状态
本地 = main @ 341c409（LOCAL merge，**未 push**；push 前须先生产 PG 加 Message.externalId 列，见 §5.3.1）。前一轮大项① i18n 全中文部署（304a77f/3be5a14）② Workshop OS 语言切换（cf5f23f）③ 三端截图文档 ④ TESTING_GUIDE ⑤ 生产测试数据清理。本轮：⑧ provider 换真——把 feat/whatsapp-real-provider 合并进 main（Meta WhatsApp provider + Message.externalId + 回执 webhook + RLS fix），go-live runbook 已写进 SETUP §5.3.1。

## 会话信息
- 原会话 ID：session-67081e33-cf2f-428c-9e46-8689c06d7b79
- 打包时间：2026-09-02
- 续接口令：继续 D&Z

## 完成进度
- i18n 全端：+~470 词条（i18n.ts ~2031），tsc/lint/build 0 错误；304a77f + 3be5a14 已上生产并验证 UI 全中文（数据值/品牌/原始枚举保持原文）。
- 语言切换：Workshop OS 桌面+移动顶栏加 LanguageToggle（cf5f23f），:3002+生产实测点击中文整页切换。
- 截图：app-screenshots/{Workshop OS 50, Mechanic 6, Rider 16}（Rider 为英文版）。工具 scripts/capture-app.ts（LANG env，登录后再设 dz_lang cookie 修 rider 中文登录）。
- 文档：docs/*截图说明.{md,pdf,docx}（DOCX 首屏）；docs/TESTING_GUIDE.md + .pdf（同事测试：Manager/Mechanic 可用账号、Rider 自助注册）。
- 生产数据清理：客户 111→2（Ahmad Danial、Muhammad binti Zain），员工 11 保留，工单 186→22/摩托 139→4/发票 155→14/预约 43→10；Supabase auth 23→12（11 孤儿删）。备份 docs/backups/prod-backup-2026-09-02T08-59-07-884Z.sql（2MB 全库，可回滚）。
- ManagerDemo/MechanicDemo 密码重置为 Dashoil@!789（managerdemo@gmail.com / mechanicdemo@gmail.com，均已实测登录）。
- 前序（已部署）：Add Staff 登录（6bc5a38）、教程 DOCX（4f3f594）、发票收款（438f233）等。
- provider 换真（本轮，本地未 push）：发现 feat/whatsapp-real-provider（d9f297a WhatsApp + 5857cc4 RLS fix）未合 main → 已合入 main（341c409，双 schema 加 Message.externalId + toE164ForWhatsApp 归一化 + 三处持久化 externalId + /api/webhooks/whatsapp 回执）；生产 build 复现通过（prisma generate --schema schema.pg.prisma && next build = 0），tsc0/lint0(118w)/test29；SETUP §5.3.1 上线 runbook（生产 PG 幂等加列→push→Vercel env→Meta webhook）；本地 dev.db 已含列，:3002/:3003/:3102 重启后 200。

## 下一步（按优先级）
1. **provider 换真上线（代码已就绪 341c409，本地未 push）**——按 SETUP §5.3.1 顺序：① 生产 PG 幂等加列 `ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "externalId" TEXT;`（先于 push）② `git push origin main` 触发 auto-deploy ③ Vercel 配 WHATSAPP_API_TOKEN/PHONE_ID/VERIFY_TOKEN/APP_SECRET(+OPENAI_API_KEY) ④ Meta 配 webhook；Payment/Notification provider 仍未做（需选网关/推送，待用户定）
2. 经销商验证（需真人：DEALER_FEEDBACK.md + DEMO_SCRIPT + 6 产品决策，dtodo 59e04e5e）
3. ✅ 已核验：清理结果无需再同步 TESTING_GUIDE.md / DEMO_ACCOUNTS.md（无已删旧账号引用）
4. 待用户定：MANAGER 权限开放更多模块；枚举下拉（MAINTENANCE/REPAIR、WHATSAPP/SMS/EMAIL/APP）是否翻中文；Rider 文档标题/说明是否改英文；Payment/Notification provider 选型
5. commit 本轮 untracked 产物（docs/*截图说明、TESTING_GUIDE、scripts/capture-app.ts/gen-*.ts 等；**prod 备份 SQL docs/backups/ 与 screenshots/ 需先 gitignore 或移出仓库**，勿入库）

## 基线测试（命令 + 期望通过数）
- pnpm exec tsc --noEmit：0 错误
- pnpm lint：0 errors（~118 warnings 存量）
- pnpm test：29 通过（5 文件）
- pnpm build：本地 sqlite 通过
- 生产 build 复现（改 schema 后必跑）：pnpm exec prisma generate --schema prisma/schema.pg.prisma && pnpm exec next build：0

## 服务与恢复
- workshop demo :3002：curl 200 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.server
- rider demo :3003：curl 200 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.rider
- e2e :3102：curl 200 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e
- 生产：curl https://d-z-crm.vercel.app（push main auto-deploy；永不本地 vercel deploy）

## git 状态
- 分支：main @ 341c409（LOCAL 已合并 provider 分支，**未 push**；push 前先做生产 PG externalId 迁移）；未跟踪约 58 项（docs/*截图说明、TESTING_GUIDE.*、docs/backups/*.sql、docs/logo-png、screenshots、scripts/capture-app.ts/gen-*.ts 等；app-screenshots/ 已 gitignore）。**注意**：prod 备份 SQL（docs/backups/prod-backup-*.sql）与 screenshots/ 含敏感/调试内容，提交前先 gitignore 或移出仓库。
- 注意：改 Prisma schema 必须 sqlite + schema.pg.prisma 同步

## 关键决策与约定
- 业务日期（预约/时段）存 UTC 零点（YYYY-MM-DD+'T00:00:00Z'）；真实时间戳 UTC，显示 toISOString().slice(0,10)
- 截图/教学用生产（本地 dev.db 的 Customer.authId 绑定会丢，rider 本地登录报 No D&Z account linked）
- i18n：只翻 UI 文案，数据值（车款/姓名/车牌/地址/日期/金额/促销名/服务类型/品牌 D&Z）与原始枚举代码不翻
- 单租户 app（org findFirst）；生产 DB 变更用幂等 SQL 定向加（勿 db push，会 DROP qrEnabled）
- DICT 追加在 i18n.ts 的 DICT 对象末尾；词条前缀 ws./mech./navr./nav./form./status./ai./role./inv. 等

## 踩坑与事实
- Playwright addInitScript 跑在隔离 world（闭包变量丢失，计数器在主 world 为 0）；主 world 需用 page.evaluate 点引导关闭按钮 / 写 localStorage 才生效
- capture-app.ts：登录后再 set dz_lang cookie——若建上下文就设中文，rider 登录页 Email tab 按钮文案变「邮箱」，hasText:"Email" 找不到导致登录失败
- docx ImageRun type 用 "jpg"（非 "jpeg"）；sharp 需 limitInputPixels:false（超大全页图如 Marketing-Posters）
- .env 值带引号需去引号再解析；addCookies 用 domain+path 勿 url+path 混用
- RLS helper app_jwt_claim 必须优先读 user_metadata（Supabase JWT 顶层 role='authenticated' 遮蔽业务 role）
- 生产数据清理：Customer 外键多为 RESTRICT 无级联，需按 BUSINESS_TABLES 叶子→根顺序删；先全库备份
- merge 提交前**勿 `git add -A`**（会把手头 untracked 产物一并卷进 merge commit）——只 `git add` 冲突/合并文件；若已卷入，备份分支 + `git reset --soft`/`--hard` 重做

## 待办（dtodo）
- 59e04e5e 经销商验证（需真人，逾期 2026-08-19）
- 92b29072 生产迁移（q2，逾期 2026-08-19）：provider 换真部分完成

## 新会话头 10 分钟
1. curl :3002 / :3003 / :3102 + 生产探活（挂了 launchctl kickstart）
2. 读 docs/HANDOFF.md + memory project/daily + dtodo
3. 跑基线（tsc 0 / lint 0errors / test 26 / build）
4. 从下一步挑：经销商验证(需真人) / provider 换真 / 同步清理到文档 / commit untracked 产物
