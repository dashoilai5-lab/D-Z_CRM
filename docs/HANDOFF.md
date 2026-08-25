# HANDOFF — D&Z Platform（2026-08-25 15:40）

> 本文件由 session-pack 生成，session-resume 可续接。历史版见 docs/HANDOFF.pre-session-pack.md。

## 一句话状态
本地与生产 = commit cc1fe58（main，分叉 0/0）。今日已完成：demo 彻底移除 → 部署流程改革 → Vercel Cron 提醒 → 生产功能②（群发统计/CDN/provider 骨架）→ Rider 4 bugfix → 里程展示重构 → QR 系统（三场景+qrToken+扫码器+业务闭环）→ 图片/海报生产 404 修复 → Rider Settings（个人资料编辑）。全程新流程：feature 分支 → push → Preview → 用户确认 → merge main → GitHub 集成自动部署。

## 会话信息
- 原会话 ID：session-0dbaff06-4fb9-49b9-a857-ddffcd6950f1
- 打包时间：2026-08-25 15:40
- 续接口令：继续 D&Z

## 完成进度
- Demo 模式彻底移除（b7649ce）：persona/demo bar/审计脚本全删，Supabase 真实登录唯一认证
- 部署流程改革（bd4026a）：main force push 覆盖废弃历史，分叉清零；GitHub 集成唯一部署通道；永不本地 vercel deploy --prod
- Vercel Cron 服务提醒（4666b3f）：/api/cron/reminders + vercel.json crons 每日 09:00 + CRON_SECRET 鉴权
- 生产功能②（36871db）：群发统计（sent/delivered/failed 徽章）、assetUrl helper、WhatsApp/OpenAI provider 骨架 + env 驱动切换
- Rider 4 bugfix（5a4ac1e）：表单对齐/布局、Book 页 Date-Time 堆叠、News 海报修复
- 里程展示重构（2156dac）：home/passport 只显示 Last/Next 服务节点，无当前里程/进度条
- QR 系统（8f951a6）：摩托/车主/门店三场景 QR + qrToken 不可枚举 + Workshop zxing 扫码器 + 落地页直达开单（jobs/new?motorcycle 预填）
- 图片/海报生产修复（44d0bbe）：本地 storage 14 文件同步生产 bucket + 新增 scripts/sync-storage-to-supabase.ts
- Rider Settings（70d2125）：/rider/settings 个人资料编辑（name/phone/email/gender/address）+ updateRiderProfile + profile 齿轮入口

## 下一步（按优先级）
1. 经销商验证（需真人）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策（dtodo 59e04e5e，逾期）
2. 生产迁移剩余项（dtodo 92b29072）：provider 换真——骨架已就绪（whatsapp-business.ts/openai.ts + env 驱动），只差 Meta WhatsApp Business 企业验证 + OpenAI billing + 密钥配置
3. 可选：Rider Settings 扩展（通知偏好/语言切换/更换密码）、Sentry 验证、k6 压测

## 基线测试（命令 + 期望通过数）
- pnpm exec tsc --noEmit：0 错误
- pnpm lint：0 errors（89 warnings 存量）
- pnpm test：20 个通过
- pnpm exec playwright test：75 过 / 6 skip / 0 败
- pnpm run build：通过

## 服务与恢复
- workshop demo：curl http://localhost:3002 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.server
- rider demo：curl http://localhost:3003 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.rider
- e2e：curl http://localhost:3102 ｜ 挂了：launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e
- 注意：改 plist env 后必须 unload+load（kickstart -k 不够）；本地服务长期运行偶发 stream closed early（重启即恢复）
- 生产：https://d-z-crm.vercel.app ｜ 部署：push main 自动（GitHub 集成）

## git 状态
- 分支：main ｜ HEAD：cc1fe58 ｜ 未提交：仅 screenshots/ 历史截图（可删可留）
- 远程：github.com/dashoilai5-lab/D-Z_CRM.git ｜ 与本地一致（分叉 0/0）

## 关键决策与约定
- 部署环境 = Vercel（唯一生产）；流程 = feature 分支 → push → Preview → 用户确认 → merge main → 自动部署
- 永不本地 vercel deploy --prod（避免 .env 污染 + 无 git 追溯）
- NEXT_PUBLIC_* 构建期内联：生产 NEXT_PUBLIC_BASE_URL 必须 = https://d-z-crm.vercel.app
- Vercel 云端构建不跑 prisma migrate deploy——schema 变更上线前必须手动应用生产 PG（PG 兼容 SQL）
- schema.pg.prisma 必须与 schema.prisma 同步（Vercel 用 PG schema）
- Rider 里程展示：不显示当前里程/进度，只显示 Last/Next 服务节点
- 门店 QR 目标：欢迎页 + Confirm 绑定（已确认）
- 配置类改动必须更新 docs/SETUP_AND_PREPARATION.md §9 台账

## 踩坑与事实
- 本地生成的海报/附件只在 ./storage（local provider），生产读 Supabase bucket——不同步则生产 404；用 scripts/sync-storage-to-supabase.ts 同步
- provider 选择：VERCEL=1 用 Supabase，否则 local（next start 恒 production，不能按 NODE_ENV 判）
- assetUrl 规则：/api/* 保持同源（拼 BASE_URL 会跨端口 404），仅 public 静态资源绝对化
- CRM-D&Z 路径含 & → bash 命令需用 workdir 参数（cd 会断）
- pnpm store 版本冲突 → 用 --store-dir .pnpm-store
- e2e 用独立 e2e.db，global-setup 清库播种 + link-auth 回填 authId + 重启服务

## 待办（dtodo）
- 59e04e5e 经销商验证（逾期 2026-08-19，需真人）
- 92b29072 生产迁移 §65（逾期 2026-08-19，q2 重要不紧急，剩 provider 换真）

## 新会话头 10 分钟
1. curl localhost:3002 / :3003 / :3102 探活，挂了 kickstart
2. 读本文件 + git log 确认 HEAD=cc1fe58
3. 跑基线：tsc + build（unit 20 / e2e 75 可选）
4. 从 dtodo 挑下一步（经销商验证需真人 / 生产迁移剩 provider 换真）
