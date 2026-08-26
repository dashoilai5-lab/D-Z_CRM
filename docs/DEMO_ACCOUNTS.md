# D&Z Platform — Demo 账号清单

> 生产环境（https://d-z-crm.vercel.app）测试账号。所有账号密码统一：`Dashoil@!789`
> 均为 Supabase Auth 账号（email/password），已绑定业务记录 + JWT claims 注入。

---

## Workshop OS（员工端，登录 /login → Account tab）

| 部门 | 姓名 | 邮箱 | 可见模块（实测） |
| --- | --- | --- | --- |
| 👑 Owner | Daniel Tan | `daniel.tan@dz.my` | 全部 23 模块 |
| 👑 Owner | CRM DO Owner | `CRM_DO_Owner@gmail.com`（密码 `Dashoil123`，Supabase 自动小写为 crm_do_owner@gmail.com） | 全部模块（实测通过） |
| 🧭 Manager | Syafiq bin Rahman | `syafiq.bin.rahman@dz.my` | 全部（管理视图） |
| 🏪 Counter | Mei Ling Wong | `mei.ling.wong@dz.my` | Dashboard/Customers/Bookings/Jobs/Packages/Stock/AI（9 项） |
| 🔧 Mechanic | Aizat bin Ismail | `aizat.bin.ismail@dz.my` | Dashboard/Jobs/Mechanic Board/Checklists/KPI（6 项） |
| 🔧 Mechanic | Hafiz bin Hassan | `hafiz.bin.hassan@dz.my` | 同 Aizat |
| 🔧 Mechanic | Ravi a/l Kumar | `ravi.a.l.kumar@dz.my` | 同 Aizat |
| 📣 Marketing | Priya a/p Lee | `priya.a.p.lee@dz.my` | Dashboard/Customers/Loyalty/Analytics/Calendar/Posters/Scripts/Reviews/AI（14 项） |
| 📦 Inventory | Wei Kit Tan | `wei.kit.tan@dz.my` | Dashboard/Products/Stock/Alerts/Dead Stock/Reorder/PO/Suppliers（11 项） |

## Rider 顾客端（登录 /rider/login）

| 顾客 | 邮箱 | 数据 |
| --- | --- | --- |
| Ahmad Danial | `ahmad.danial@dz.my` | 12 工单 / 1 预约 / 1 车（数据最全，体验推荐） |
| Muhammad binti Zain | `muhammad.zain@dz.my` | 3 台车 |

## 自助注册（免确认）

- 注册页：https://d-z-crm.vercel.app/rider/signup
- 测试域（`@dz.my` / `test.*` / `dztest*`）走 admin API 直建：**免确认邮件 + 免 signUp 限流 + 注册后自动登录**
- 生产真实用户（非测试域）走标准 email confirm 流程

---

## 说明

1. **密码**：全部 `Dashoil@!789`（含 @ 和 !，URL 编码时注意）
2. **权限导航**：登录后按角色显示导航（navForRole 按 permissions.ts 视图矩阵过滤），无权模块 URL 直访被 middleware 拦截
3. **RLS 生效**：所有账号 JWT 含 orgId/branchId/role/userId（员工）或 customerId（顾客）claims
4. **账号来源**：Supabase Auth（service-role admin 创建，email_confirm=true）→ User/Customer.authId 绑定（本地 + 生产 PG 同步）
5. **安全提示**：这些是公开的 demo 账号，生产环境上线前应禁用或更换密码
6. **同窗口多角色**：同一浏览器同时只能登录一个角色（Supabase session 存单 cookie，后登录覆盖前一个——标准行为，非 bug）。演示多角色请用多个隐身窗口 / 不同浏览器 profile，各登一个部门账号
