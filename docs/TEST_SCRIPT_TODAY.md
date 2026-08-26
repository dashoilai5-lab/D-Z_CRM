# 人工全流程测试清单（2026-08-25 下午）

> 环境：生产 https://d-z-crm.vercel.app（推荐，验证最新部署）或本地 :3003（rider）/ :3002（workshop）。
> 所有账号密码：`Dashoil@!789`。建议用 2-3 个隐身窗口：窗口 A=Rider、窗口 B=Owner/Counter、窗口 C=Mechanic（Supabase 单 session，同窗口只能一个角色）。

## Phase 1 — Rider 端（窗口 A，ahmad.danial@dz.my）

| # | 操作 | 期望 |
| --- | --- | --- |
| 1 | 打开 /rider/login → 邮箱密码登录 | 进入 /rider/home，问候语 + 爱车卡 |
| 2 | home 右上角：**扫码按钮**（ScanLine 图标） | 点击打开全屏扫码器（黑底+取景框），关闭可返回 |
| 3 | home 促销卡 | 「特别优惠」卡片 + 查看全部（若语言为中文） |
| 4 | /rider/book → 选门店（Kuala Lumpur） | 选店界面正常（营业时间/可用时段），点店进入表单 |
| 5 | 表单：选摩托 → 套餐（Standard RM120，BEST VALUE 徽标）→ 附加服务 → 日期/时间 → 提交 | 预约成功 toast，跳 /rider/bookings 显示 REQUESTED |
| 6 | /rider/bookings | 新预约 REQUESTED（中文文案） |
| 7 | /rider/settings | Profile 表单（Name/Phone/Email/Gender/Address）+ **Language 切换** + 通知偏好 4 开关 + 安全（改密码） |
| 8 | Settings → Language 点「中文」 | 全站文案变中文（底部导航/各页标题/表单） |
| 9 | 通知偏好：关「App 公告」→ 保存偏好 → 刷新 | 开关保持关闭（DB 持久化）→ 再开回 |

## Phase 2 — Workshop 端（窗口 B，daniel.tan@dz.my Owner）

| # | 操作 | 期望 |
| --- | --- | --- |
| 10 | /login → Account tab → 登录 | dashboard 正常（6+ 指标、AI 推荐） |
| 11 | /workshop/bookings | 看到 Rider 刚提交的预约（REQUESTED）→ **Confirm** |
| 12 | 预约操作 → **Check In**（里程填 31800，套餐 Standard RM120） | 建工单 + 预约变 CHECKED_IN |
| 13 | 工单详情 → AI Sales Recommendations → 添加 Oil Filter RM25 | 明细行出现（reason 5,200 km） |
| 14 | /workshop/jobs 列表 | 新工单状态正确 |

## Phase 3 — Mechanic + 客户审批（窗口 C，aizat.bin.ismail@dz.my）

| # | 操作 | 期望 |
| --- | --- | --- |
| 15 | /login 登录（Mechanic）→ /workshop/mechanic | 新工单出现在看板 |
| 16 | 工单 → Start checklist → Engine Oil/Oil Filter/Brake PASS → **Chain WARNING** | 检查单保存，备注「Chain is too loose.」 |
| 17 | 请求客户审批 → Chain Adjustment RM20 → Send | 工单 → AWAITING_APPROVAL |
| 18 | 窗口 A（Rider）→ /rider/approvals | 显示「需要额外作业 — Chain Adjustment — RM20」→ **批准** |
| 19 | 窗口 C（Mechanic）→ 工单刷新 | 显示 CUSTOMER APPROVED → **Complete Service** |
| 20 | 窗口 A（Rider）→ /rider/invoices | 新发票 RM165（Standard 120 + Oil Filter 25 + Chain 20）· PAID |
| 21 | 窗口 A → /rider/service-history | 新服务记录（31,800 km） |
| 22 | 窗口 A → /rider/home | Next Service 34,800 km 更新 |
| 23 | 窗口 A → /rider/notifications | 收到工单状态通知（服务中/待审批/完成） |
| 24 | 窗口 A → 服务历史 → 评价（Rate this service ★） | 提交成功，感谢文案 |

## Phase 4 — QR 场景（本轮新增）

| # | 操作 | 期望 |
| --- | --- | --- |
| 25 | 门店 QR：rider 首页扫码器扫 workshop QR（可在 workshop Settings→QR Codes 找码，或手机拍屏） | 打开 /qr/workshop/<token>：门店卡 **512px 居中**（不压缩）→「确认进入」绑定门店 |
| 26 | Rider profile QR（/rider/profile 会员卡下 QR）用 workshop 扫码器扫 | /qr/rider/<token> 显示车主档案 |
| 27 | 摩托 QR（/rider/motorcycles/<id> 或详情页）用 workshop 扫 | /qr/motorcycle/<token> 显示车辆 + 车主 |
| 28 | 未登录状态访问 /rider/home | 直接 307 → /rider/login 表单（无「Sign in + Create account」中间页） |

## 已知注意点

1. 同窗口多角色：Supabase 单 session，后登录覆盖前一个——多角色用隐身窗口（标准行为，非 bug）
2. 测试数据会真实写入（demo 账号），预约/工单/发票会累积
3. 生产数据与本地 dev.db / e2e.db 相互独立
4. 若某步文案仍为英文：检查语言 cookie（Settings → Language 切换）
5. 密码改密测试请改回 `Dashoil@!789`（影响共享测试账号）

---
发现 bug 直接记下（页面 + 操作 + 期望 vs 实际），我逐个修。
