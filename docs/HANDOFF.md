# HANDOFF — D&Z Platform（2026-08-25 16:30，会话 session-48b43fbb 续接更新）

> 本文件由 session-pack 生成，session-resume 可续接。历史版见 docs/HANDOFF.pre-session-pack.md。

## 一句话状态
本地与生产 = main @ 6f5f092（analytics 增强已 merge）。今日已完成：…Rider Settings（个人资料编辑）→ Rider Settings 扩展（已上线）→ **Rider App 语言 bug 修复**（merge 33aad24：全站 i18n cbebcbd + Special Offer 卡片等 e4d2f6d）。流程约定：feature 分支 → 本地预览验证 → push → merge main → 自动部署（用户强调：先本地预览后才 push）。

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
- Rider Settings 扩展（3558075，feat/rider-settings-ext 待 merge）：语言切换（EN/中文/BM + dz_lang cookie）、通知偏好（4 开关 + Customer.notificationPrefs Json，迁移 rider_settings_ext）、更换密码（signInWithPassword 校验 + auth.updateUser）；settings 文案 i18n 化；middleware 补 /rider/settings 私有页保护

## 下一步（按优先级）
1. 经销商验证（需真人）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策（dtodo 59e04e5e，逾期）
2. 生产迁移剩余项（dtodo 92b29072）：provider 换真——骨架已就绪（whatsapp-business.ts/openai.ts + env 驱动），只差 Meta WhatsApp Business 企业验证 + OpenAI billing + 密钥配置
3. 【已完成】Rider Settings 扩展（merge 077a378 → 生产，生产 PG 已 ALTER，生产实测通过）
3b. 【已完成】Rider App 语言 bug 修复（merge 33aad24 → 生产，生产实测通过）
3c. 【已完成】Rider 首页 QR 扫码器（merge d871868）——首页右上角扫码按钮，复用 workshop QrScanner
3d. 【已完成】QR 落地页布局修复（merge 29d460f）——workshop/motorcycle/rider 三页宽度压缩（flex mx-auto 吸收自由空间 298→512px）+ 垂直居中
3e. 【已完成】移除登录引导页（merge 34fa9d4）——sign-in-prompt 删除，未登录访问 rider 页直接 307 → /rider/login 表单
3f. 【已完成】人工测试 bug 修复（merge 969d638）：① book 时段选择——日期后显示真实 open slots 按钮组 + estimated 标注 ② 时段剩余量（剩 N 位）③ 预约/时段日期时区归一（UTC 零点，两端时间一致；生产 PG 数据已归一）
3g. 【已完成】Workshop bookings 增强（merge 8049024）：状态筛选条（All/等待确认/已确认/…，?status=）+ 每行创建时间（Submitted 相对时间）+ 日期升降序（Date ↑↓，?sort=）+ Reset 按钮（Filter 旁，清空全部筛选）+ 排序未来优先/时区边界统一
3h. 【已完成】Booking→Job service 内容同步（merge 4714e46）：Booking 加 servicePackageId/serviceAddons（迁移 booking_service_fields，生产 PG 已 ALTER）；rider book 结构化存套餐+附加；Check In 建 job 自动同步（counter 可覆盖）；Check In 对话框 service 摘要；另修 job branch 归属/失败反馈
3i. 【已完成】新增 Owner 账号 CRM_DO_Owner@gmail.com（Dashoil123，本地+生产可用）
3j. 【已完成】技师结算/薪资/发薪闭环（merge ec60721，9 commit）：settlements 页 = 时间 filter（Today/3d/7d/30d+）+ foreman 发薪中心（点技师→每日账单含完成的 job 明细→tick 批量/分期）+ 薪资规则（Organisation.salaryRules）+ 发薪历史（StaffPayout/StaffPayoutPayment，生产表已建）+ Finance 周期收支（成本+薪资=出钱）+ 客户发票 tick/split 结清 + 发票完成流程改 ISSUED 待结清
3k. 【已完成】技师考勤（merge f4e14a8）：Attendance 表（生产已建）；/workshop/attendance 打卡上下班 + 全员可用列表（ON DUTY 置顶/已下班/未打卡）；本地 mechanic authId 已重绑
3l. 【已完成】Analytics 增强（merge 6f5f092）：月度服务量（12 个月 jobs+去重车辆）+ 品牌分析（服务量/收入/占比/Top 型号）+ 时间 filter（7d/30d/90d/12m）+ from→to 自定义范围；sales/service/customer/revenue 加 untilDays 边界
4. 【待确认】Rider App 语言 bug 修复（fix/rider-language，cbebcbd 已 push，本地预览全页面中文通过）——确认后 merge
5. 可选：Sentry 验证、k6 压测

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
- 分支：main ｜ HEAD：6f5f092（merge analytics 增强）｜ 未提交：仅 screenshots/ 截图
- 远程：与本地一致（分叉 0/0）；全部 feature/fix 分支已清理

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
- 本地 dev.db 被 prisma migrate reset 后，测试账号 Customer.authId 绑定会丢（seed 只建 authId=null 演示客户）——需重新绑定 Supabase auth id 才能本地登录测试（本次已手动重绑 ahmad.danial@dz.my）

## 待办（dtodo）
- 59e04e5e 经销商验证（逾期 2026-08-19，需真人）
- 92b29072 生产迁移 §65（逾期 2026-08-19，q2 重要不紧急，剩 provider 换真）

## 新会话头 10 分钟
1. curl localhost:3002 / :3003 / :3102 探活，挂了 kickstart
2. 读本文件 + git log 确认分支/HEAD（当前 feat/rider-settings-ext @ 3558075）
3. 跑基线：tsc + build（unit 20 / e2e 75 可选）
4. 看下一步：Rider Settings 扩展待 merge（先生产 PG ALTER 加列）/ 经销商验证需真人 / provider 换真
