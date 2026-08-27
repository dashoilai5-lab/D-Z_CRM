# HANDOFF — D&Z Platform（2026-08-26 16:30，会话 session-48b43fbb 续接更新）

> 本文件由 session-pack 生成，session-resume 可续接。历史版见 docs/HANDOFF.pre-session-pack.md。

## 一句话状态
本地与生产 = main @ 38b7063，已全部 push，三服务 200。
Mechanic App + 工作统计 + LC135 拆分 + **Rider 手机/邮箱双通道登录&注册**（手机必填/邮箱选填/gender/密码确认/老客手机号绑定 authId）已上线（生产实测手机+email 登录、注册页全字段）。上线准备：docs/ONBOARDING_PLAN.md（资料收集表+模块开放策略）+ scripts/setup-workshop-modules.ts（模块覆盖脚本，留在 feat/workshop-module-setup 分支未 merge）。
剩余需求：Rider ①②④（手机/WhatsApp 登录、老客注册、每月换油提醒）+ Workshop ④（3-6-12 月保养时间线）+ 经销商验证 + provider 换真。
流程约定：feature 分支 → 本地预览验证 → push → merge main → 自动部署（用户强调：先本地预览后才 push）。

## 会话信息
- 原会话 ID：session-48b43fbb-52c1-4525-b241-f66f5c279c34（名称「继续D&Z开发」）
- 打包时间：2026-08-26 16:30
- 续接口令：继续 D&Z

## 完成进度
- Demo 模式彻底移除（b7649ce）：persona/demo bar/审计脚本全删，Supabase 真实登录唯一认证
- 部署流程改革（bd4026a）：main force push 覆盖废弃历史；GitHub 集成唯一部署通道；永不本地 vercel deploy --prod
- Vercel Cron 服务提醒（4666b3f）：/api/cron/reminders + vercel.json crons 每日 09:00 + CRON_SECRET 鉴权
- 生产功能②（36871db）：群发统计徽章、assetUrl helper、WhatsApp/OpenAI provider 骨架 + env 驱动切换
- Rider 4 bugfix（5a4ac1e）、里程展示重构（2156dac）、QR 系统（8f951a6，摩托/车主/门店三场景）
- 图片/海报生产修复（44d0bbe）：storage 同步 + scripts/sync-storage-to-supabase.ts
- Rider Settings（70d2125）+ 扩展（merge 077a378）：语言切换（dz_lang cookie）、通知偏好（4 开关）、更换密码
- Rider 语言 bug 修复（merge 33aad24）、首页 QR 扫码器（merge d871868）、QR 落地页布局修复（merge 29d460f）
- 移除登录引导页（merge 34fa9d4）：未登录访问 rider 页直接 307 → /rider/login
- 人工测试 bug 修复（merge 969d638）：book 真实 open slots 按钮组 + 剩余量 + 预约/时段日期时区归一（UTC 零点）
- Workshop bookings 增强（merge 8049024）：状态筛选 + 创建时间 + 日期升降序 + Reset + 未来优先
- Booking→Job service 同步（merge 4714e46）：servicePackageId/serviceAddons（生产 PG 已 ALTER）+ Check In 自动同步
- 新增 Owner 账号 CRM_DO_Owner@gmail.com（Dashoil123，本地+生产可用）
- 技师结算/薪资/发薪闭环（merge ec60721，9 commit）：settlements 时间 filter + foreman 发薪中心 + 薪资规则 + 发薪历史 + Finance 周期收支 + 客户发票结清 + 发票 ISSUED 待结清
- 技师考勤（merge f4e14a8）：Attendance 表（生产已建）+ /workshop/attendance 打卡
- Analytics 增强（merge 6f5f092）：月度服务量 + 品牌分析 + 时间 filter（7d/30d/90d/12m）+ from→to
- Mechanic 专属 App（merge 9a54f5c，6 commit）：/mechanic-app（仅 MECHANIC）Grab 接单 + job 详情 + Earnings + Profile + Settings + 发薪双向确认（PENDING→MECHANIC_APPROVED→PAID）+ 全 i18n
- Mechanic Profile 工作统计（294dd21）：汇总（工单/客单价/评分）+ 12 个月月度趋势柱状（+8 业务月）
- Yamaha LC135 车型拆分（merge 9b9e412）：135LC Fi → LC135 V1 / LC135 V2 - V7 / LC135 V8（bike-models 下拉 + seed 目录，本地+生产实测）
- 手机号注册/登录放宽+国家区号（merge 38b7063）：phone.ts 加 digitsOnly/combinePhone/normalizePhoneLoose/matchKey/COUNTRY_CODES；任意数字号码即通过（不再报 Phone required）；注册/登录页区号下拉显示国家名（默认 Malaysia +60）；Customer.phone 存 E.164 兼容旧本地格式；e2e 20 过——生产实测区号下拉 ✓
- Rider 首辆摩托引导（merge 859c21d）：登录/注册 action 返回 hasBike；无车用户登录/注册跳 /rider/bike-first（表单+稍后再说）；home 无车虚线引导卡；motorcycles 空态引导卡；三语词条 bike.first-*——生产实测注册→跳引导 ✓
- Workshop 自动刷新（merge 9345744）：顶部常驻刷新按钮 + Auto 开关（默认开 30s router.refresh 软刷新不丢状态），desktop header + mobile sticky 条——生产实测控件显示 ✓
- Developer Settings（merge 21dff21）：/workshop/settings/developer 仅 OWNER——密码门禁 15min（dz_dev HttpOnly cookie，secure 按协议判断）+ 角色×模块访问矩阵（Permission 覆盖行即时生效：navForRoleWithPerms 导航过滤 + layout can() URL 守卫）+ first-wave 预置 + 清空业务数据（保留配置，事务删 40 业务表）｜踩坑：server→client 传 icon 组件引用报 ERROR 60597609（sidebar 改 key 内部映射图标）；本地 dev.db 已清空为试用空店（备份 prisma/dev.db.bak-1054，恢复=cp 回+重启）｜生产实测解锁+矩阵 ✓
- 账号控制·路由隔离矩阵（merge 8ac3027）：middleware 按 JWT claims role 隔离 + 三端 layout 权威守卫——rider 只能 rider app（访问 workshop OS 弹回 /rider/home）、mechanic 只能 mechanic app（登录直达）、员工（除 mechanic）才能 workshop OS；登录后按角色跳转；e2e 全量 74/75（1 并发 flake 单跑过），生产实测三角色隔离 ✓
- Mechanic App 登出修复（merge 3aefea6）：profile 页右上角加 SignOutIconButton（复用 rider 组件 href 参数化 /login，三语 mech.signout）——生产实测登出→/login + middleware 拦截 ✓
- Rider 手机/邮箱双通道（merge 5cc2978，8 commit）：登录手机或邮箱二选一（src/lib/phone.ts 归一化 013-125 2832/0131252832/+60131252832，E.164 去 60 前缀补前导 0）；手机号→Customer.phone→authId→email 登录（兼容现有账号）/phone-only 走 Supabase phone（需开 Phone provider）；注册页手机必填+邮箱选填+gender+密码确认；手机号匹配老客绑 authId 不新建（Rider ② 核心）｜生产实测：手机号 012-345 6789 登录 ✓ email 登录 ✓ 注册页全字段 ✓；注意生产 Customer 是旧 seed（email 全 null、phone 占位号）
- 上线准备（本地存档，未部署）：docs/ONBOARDING_PLAN.md——workshop 上线计划（资料收集表 §1/模块开放策略 §2 第一波开 13 关 15/CSV 模板/检查清单）；scripts/setup-workshop-modules.ts——按 org×角色×模块 写 Permission 覆盖行关闭进阶模块（--dry-run/--open/--close/--open-all 可逆）
- 注：294dd21/a9db9cf 两次小改动直接在 main 提交（未走 branch 流程），已向用户说明后续按流程

## 下一步（按优先级）
1. 经销商验证（需真人，dtodo 59e04e5e 逾期）：填 docs/DEALER_FEEDBACK.md，按 DEMO_SCRIPT 演示，回答 6 个产品决策
2. 生产迁移 §65（dtodo 92b29072，q2）：provider 换真——骨架已就绪（whatsapp-business.ts/openai.ts + env 驱动），只差 Meta WhatsApp Business 企业验证 + OpenAI billing + 密钥配置
3. Rider ① 手机/WhatsApp 登录（当前用邮箱+密码，需 Supabase phone auth 或 WhatsApp OTP）
4. Rider ② 老客户注册（老客已有历史记录，注册时关联）
5. Rider ④ 每月换油提醒（Cron 已有每日 09:00 骨架，扩展按 serviceInterval 触发）
6. Workshop ④ 3-6-12 月保养时间线（客户维度服务时间线视图）
7. 可选：Sentry 验证、k6 压测

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
- 注意：:3002 与 :3003 共享 .next——构建后必须两个都重启（否则陈旧 chunk 报 "couldn't load"）；改 plist env 后必须 unload+load（kickstart -k 不够）；本地服务偶发 stream closed early（重启即恢复）
- 生产：https://d-z-crm.vercel.app ｜ 部署：push main 自动（GitHub 集成）

## git 状态
- 分支：main ｜ HEAD：38b7063（Merge fix/phone-register）｜ 已 push
- 本地 dev.db：试用空店状态（业务全清、配置保留）；员工 authId 已全重绑（owner/manager/counter/marketing/inventory/mechanic×3）
- feat/workshop-module-setup @ a614dc0：模块覆盖脚本 + 台账（未 merge 未 push，用户决定不需要；ONBOARDING_PLAN.md 已在 main）
- feat/rider-phone-login 已合并上线并清理（5cc2978 → 生产）
- 未提交：仅 screenshots/ 截图 + scripts/_tmp-fix-dates.ts（临时脚本，可删）
- 远程与本地一致（分叉 0/0）；全部 feature/fix 分支已清理

## 关键决策与约定
- 部署环境 = Vercel（唯一生产）；流程 = feature 分支 → push → Preview → 用户确认 → merge main → 自动部署
- 永不本地 vercel deploy --prod（避免 .env 污染 + 无 git 追溯）
- NEXT_PUBLIC_* 构建期内联：生产 NEXT_PUBLIC_BASE_URL 必须 = https://d-z-crm.vercel.app
- Vercel 云端构建不跑 prisma migrate deploy——schema 变更上线前必须手动应用生产 PG（PG 兼容 SQL）；schema.pg.prisma 必须与 schema.prisma 同步
- 业务日期（预约日/时段日/结算日）统一存 UTC 零点（YYYY-MM-DD + 'T00:00:00Z'），禁止服务器本地时刻（本地 +8 vs Vercel UTC 会偏移）；显示用 toISOString().slice(0,10) / fmtDate；周期窗口用 src/lib/period.ts periodWindow()
- 发薪双向确认：workshop 发起 PENDING → mechanic app 批准 MECHANIC_APPROVED → workshop Agree CASH/QR → PAID
- 配置类改动必须更新 docs/SETUP_AND_PREPARATION.md §9 台账（env/模块/API/迁移/端口/依赖/测试/i18n）
- Rider 里程展示：不显示当前里程/进度，只显示 Last/Next 服务节点

## 踩坑与事实
- 本地生成的海报/附件只在 ./storage（local provider），生产读 Supabase bucket——不同步则生产 404；用 scripts/sync-storage-to-supabase.ts
- provider 选择：VERCEL=1 用 Supabase，否则 local（next start 恒 production，不能按 NODE_ENV 判）
- assetUrl 规则：/api/* 保持同源（拼 BASE_URL 会跨端口 404），仅 public 静态资源绝对化
- 本地 dev.db 被 prisma migrate reset 后，Customer.authId 绑定丢失（seed 只建 authId=null）——需查 Supabase admin API 重绑测试账号（ahmad.danial@dz.my、daniel.tan@dz.my、aizat/hafiz/ravi 等）；已重绑但根治方案=把绑定写进 seed
- node-pg 显示 timestamp 无 tz 时按 +8 偏移——用 to_char 确认存储值是正确零点即非 bug
- 模板字符串里 ${ 在写文件时需转义
- CRM-D&Z 路径含 & → bash 命令需用 workdir 参数（cd 会断）
- e2e 用独立 e2e.db，global-setup 清库播种 + link-auth 回填 + 重启服务

## 待办（dtodo）
- 59e04e5e 经销商验证（逾期 2026-08-19，需真人：DEALER_FEEDBACK.md + DEMO_SCRIPT + 6 产品决策）
- 92b29072 生产迁移 §65（逾期 2026-08-19，q2 重要不紧急，剩 provider 换真）

## 测试账号（docs/DEMO_ACCOUNTS.md 全量）
- Owner：CRM_DO_Owner@gmail.com / Dashoil123（密码 Dashoil@!789）
- 技师：aizat.bin.ismail@dz.my / hafiz.bin.hassan@dz.my / ravi.a.l.kumar@dz.my / daniel.tan@dz.my
- 客户：ahmad.danial@dz.my 等

## 新会话头 10 分钟
1. curl localhost:3002 / :3003 / :3102 探活，挂了 kickstart（注意两服务共享 .next）
2. 读本文件 + git log 确认分支/HEAD（main @ a9db9cf，已 push）
3. 跑基线：tsc + build（unit 20 / e2e 75 可选）
4. 看下一步：经销商验证（需真人）/ provider 换真 / Rider ①②④ / Workshop ④
