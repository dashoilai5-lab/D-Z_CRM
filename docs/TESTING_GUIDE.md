# D&Z Platform — 测试指引（ManagerDemo / MechanicDemo / RiderDemo）

> 面向同事的功能测试指引。统一生产环境：**https://d-z-crm.vercel.app**

---

## 〇、介绍页（营销落地页 / 官网首页）

| 项 | 值 |
| --- | --- |
| 说明 | D&Z 产品官网首页（三语 EN / 中文 / BM），非登录页 |
| 入口 | **https://d-z-crm.vercel.app/intro**（`/intro/` 会自动 308 重定向到 `/intro`） |
| 内容 | Hero 产品视觉（Workshop 大 mockup + Rider/Mechanic 手机浮层）、三语切换、产品动态演示视频、Capabilities / Apps / Stats / Journey / CTA |
| 跳转 | 顶部「Explore now」下拉 + 底部 CTA 三按钮，分别跳 Workshop / Rider / Mechanic |

> 四个入口：介绍页 `/intro` · Workshop `/login` · Rider `/rider/login` · Mechanic `/mechanic-app`。

---

## 一、Manager 测试（ManagerDemo · Workshop OS 管理端）

| 项 | 值 |
| --- | --- |
| 角色 | 经理（MANAGER），登录 **Workshop OS**（管理视图） |
| 邮箱 | `managerdemo@gmail.com` |
| 密码 | `Dashoil@!789` |
| 入口 | https://d-z-crm.vercel.app/login |

- 打开 `/login` → 输邮箱 + 密码 → 「Sign in」。
- 登录成功进入 Workshop OS（电脑端）；当前 MANAGER 权限显示管理模块（Dashboard / Tasks / Loyalty / Analytics / Notifications 等）。如需开放更多模块，请联系管理员调整权限。

## 二、Mechanic 测试（MechanicDemo · Mechanic App 技师手机端）

| 项 | 值 |
| --- | --- |
| 角色 | 技师（MECHANIC），使用 **Mechanic App**（手机端） |
| 邮箱 | `mechanicdemo@gmail.com` |
| 密码 | `Dashoil@!789` |
| 入口 | https://d-z-crm.vercel.app/login |

- 打开 `/login` → 输邮箱 + 密码 → 「Sign in」；登录后自动进入 **Mechanic App**（订单 / Earnings / Profile / Settings / Notifications）。
- 建议用**手机浏览器**或浏览器手机模拟（窄屏）体验。

## 三、Rider 测试（自助注册创建账号 · Rider App 顾客手机端）

> Rider 顾客端**无需现成账号**，请自己注册一个：

- 注册页：**https://d-z-crm.vercel.app/rider/signup**
- 填写：**姓名**、**手机号（必填）**、可选**邮箱**、性别（可选）、**密码 + 确认密码** → 提交注册。
- 注册成功即进入 **Rider App**（首页 / 预约服务 / 我的车 / 服务历史 / 优惠 / 我的），可完整走「预约 → 服务 → 历史 → 评价」流程。
- **快捷免确认**：用测试域名邮箱注册（以 `test.` 开头的邮箱如 `test.you@gmail.com`，或 `dztest...`，或以 `@dz.my` 结尾）→ **免邮箱确认 + 注册后自动登录**。
- 若用普通邮箱（如 `you@gmail.com`）：需去邮箱点确认链接，再登录（`/rider/login`）。

---

## 四、通用注意事项

1. **三端同一平台**：Workshop OS（员工/管理）、Mechanic App（技师）、Rider App（顾客），数据互通。
2. **密码**：Manager / Mechanic 均为 `Dashoil@!789`（含 @ 与 !，输入时注意）。
3. **一次一个角色**：同一浏览器同一时间只能登录一个账号（Supabase 单 session，后登录覆盖前一个）。测多个角色请用**多个隐身窗口 / 不同浏览器**。
4. **登录方式**：员工/技师用 `/login`（Account，邮箱+密码）；顾客端用 `/rider/login` 或注册 `/rider/signup`。
5. **测试数据**：如需预置数据（Ahmad 12 工单 / 3 车等）测试，可用 `ahmad.danial@dz.my`（密码 `Dashoil@!789`，见 docs/DEMO_ACCOUNTS.md）。
6. 测试中若报 `No D&Z account linked` / 无法登录，多为账号未绑定或未确认，请联系管理员。

---

## 备注
- 账号为 Supabase Auth（邮箱+密码），已绑定业务记录与权限 claims。
- 生产环境上线前建议禁用或更换这些测试账号密码（见 docs/DEMO_ACCOUNTS.md 安全提示）。
