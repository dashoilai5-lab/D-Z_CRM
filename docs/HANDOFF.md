# HANDOFF — D&Z Platform（2026-08-25 08:30）

> 本文件由 session-pack 生成，session-resume 可续接。历史版见 docs/HANDOFF.pre-session-pack.md。

## ⚠️ 2026-08-25 会话打包（session-c31025da-bd87-4fa4-a8c4-37d1db1d2021）

## 一句话状态
**本地与生产 = commit b7649ce（demo 模式彻底移除）**：无 persona、无 DemoBar、无 demo 数据路径——Supabase 真实登录唯一认证。生产部署 d-z-dhqv4laev（PROMOTED，alias 确认，浏览器实测 workshop/rider 均无 demo bar）。git HEAD = b7649ce（基于 aeba0c5 + A4 清理 + demo 移除），工作树干净（仅 screenshots/ 历史截图未跟踪）。

## 会话信息
- 原会话 ID：session-c31025da-bd87-4fa4-a8c4-37d1db1d2021
- 打包时间：2026-08-25 08:30
- 续接口令：继续 D&Z

## 完成进度（本会话）
- **demo 模式彻底移除（用户明确要求，commit b7649ce）**：删除 persona.ts/demo.ts/demo-user.ts/demo-customer.ts/reset.ts/actions/demo.ts/demo-bar.tsx + 5 个 persona 审计脚本（dark-*/mobile-audit）；middleware 只留 Supabase+legacy；session-user 纯 Supabase（getRiderCustomer 替代 getDemoCustomer）；nav-registry WorkshopPersona（真实 Role→导航分组）；i18n 删 demo/persona 词条；.env 删 DEMO_MODE；e2e 全部改真实 Supabase 登录（helpers.setPersona → 登录 DEMO_ACCOUNTS 账号，global-setup 播种后 e2e/link-auth.ts 回填 authId，修复 sidebar-user/inventory 断言）；生产已部署验证无 demo bar。
- **续接会话（session-0dbaff06，2026-08-25）A4 Demo 清理收尾**：① src/actions/demo.ts demo actions 加生产守卫（demoEnabled()：NODE_ENV=production 且无 NEXT_PUBLIC_DEMO_MODE 时 setPersona/resetDemo 直接拒绝——封死 resetDemo 清 34 张表的旁路）② src/app/rider/home/page.tsx 生产无顾客档案时显示 RiderSignInPrompt 登录引导（替代 "Demo customer not found" 文案）③ prisma/seed.ts 加 NODE_ENV=production 守卫（SEED_ALLOWED=1 覆盖），防生产误跑 seed 污染。验证：tsc 0 / lint 0 err / unit 20 / e2e smoke 57 / build 通过。DEPLOYMENT_CHECKLIST A4 全勾 + SETUP §9 台账已更新。提交待做。
- QR 系统实现并回滚：bike passport QR / workshop 注册 QR / settings Workshop QR / QR 中心 / qrEnabled 开关 / QR 放大模态——全部实现验证后，用户决定不要，已整体移除（commit 6e84933）
- Cloudflare Pages 迁移尝试并放弃：wrangler login / Hyperdrive / KV / OpenNext 1.20 build 全走通，但 Prisma engineType=client 的 WASM 与免费 3MiB worker 限制冲突（opennextjs-cloudflare#139），且 OpenNext deploy 目标是 workers.dev 非 Pages → 放弃，回 Vercel（云端资源已清理）
- demo 体验统一为 demo accounts（commit 4d68224）：DemoBar 精简、NEXT_PUBLIC_DEMO_MODE→DEMO_MODE、本地走真实登录——用户最终选择回退，此改动随 reset 撤销
- 最终回退：git reset --hard aeba0c5 + Vercel promote 到 d-z-ntvjidid3，本地与生产完全一致

## 下一步（按优先级）
1. 从 aeba0c5 继续开发（如需）：开新分支，避免再引入 QR / demo 统一 / Cloudflare 改动
2. 经销商验证（需真人）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策（dtodo 59e04e5e，逾期）
3. 生产迁移剩余项（dtodo 92b29072）：provider 换真（WhatsApp/OpenAI）等

## 基线测试（命令 + 期望通过数）
- pnpm exec tsc --noEmit：0 错误
- pnpm run build：通过（aeba0c5 已验证）
- pnpm exec playwright test：本版本 e2e 中 booking 流程可能失败（aeba0c5 的 middleware 用 NODE_ENV 判定，demo persona 修复 041e890 在它之后）——这是回退版本的固有属性，非 bug；如需 e2e 全绿需在后续版本恢复 demo 判定

## 服务与恢复
- workshop demo：curl http://localhost:3002 ｜ 挂了：launchctl unload ~/Library/LaunchAgents/com.dz-platform.server.plist && launchctl load ~/Library/LaunchAgents/com.dz-platform.server.plist
- rider demo：curl http://localhost:3003 ｜ 挂了：同上 rider plist
- e2e：curl http://localhost:3102 ｜ 挂了：同上 e2e plist
- 注意：改 plist env 后必须 unload+load（kickstart -k 不够）
- 生产：https://d-z-crm.vercel.app ｜ 部署：CI=true npx vercel deploy --prod --yes（当前指向 d-z-ntvjidid3 = aeba0c5）

## git 状态
- 分支：main ｜ HEAD：aeba0c5 ｜ 未提交：仅 screenshots/*.png（历史截图，可删可留）
- 注意：git 历史中 aeba0c5 之后有 12 个 commit（QR/回滚/demo 统一/docs），已 reset 撤销；若 push 需 force（建议新分支）

## 关键决策与约定
- 部署环境 = Vercel（唯一生产），Cloudflare 不可行（记录在 SETUP §9）
- QR 系统不要，用户明确移除
- 本地 :3002/:3003 + e2e :3102，端口固定；:3000 被 DashOil 占用禁用
- 配置类改动必须更新 docs/SETUP_AND_PREPARATION.md §9 台账

## 踩坑与事实
- NEXT_PUBLIC_* 在 Next.js server 端也构建期内联，运行时 env 覆盖无效
- pnpm install 清 node_modules/.prisma，需重新 prisma generate；playwright bin 丢失需 pnpm install 重建
- launchd plist 改 env 后需 unload+load 重新加载
- Vercel 别名 promote 后边缘缓存传播有延迟，API（targets.production）是权威
- .env 的 NEXT_PUBLIC_DEMO_MODE="true" 是 aeba0c5 的 DemoBar 显示开关（本地演示用）

## 待办（dtodo）
- 59e04e5e 经销商验证（逾期 2026-08-19）
- 92b29072 生产迁移 §65（逾期 2026-08-19，q2 重要不紧急）

## 新会话头 10 分钟
1. curl http://localhost:3002 / :3003 / :3102 探活，挂了 unload+load plist
2. 读本文件 + git log 确认 HEAD=aeba0c5
3. 跑基线：tsc + build
4. 从 dtodo 挑下一步（经销商验证 or 生产迁移）
