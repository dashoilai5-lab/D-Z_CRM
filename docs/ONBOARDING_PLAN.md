# D&Z Platform — Workshop 上线计划（demo → 真实运营）

> 目标：帮一家真实摩托车维修店（workshop）从 demo 期切换到真实运营。
> 设计原则：**第一波只开放基础运营闭环，其余模块默认关闭**，随运营成熟分批开放。
> 配套：本文件 + 资料收集表（§附录A）+ CSV 导入模板（§附录B）+ 上线检查清单（§附录C）。

---

## 0 · 一句话路线

签约 → 收集基础资料 → 建 org/账号 → 配置服务与套餐 → 导入客户车辆 → 品牌与集成 → 培训试运行 → 上线。

**默认关闭**（见 §2 模块策略）：销售线索、营销、自动化、忠诚度、AI、消息模板等进阶模块，第一波不开放。

---

## 1 · 资料收集清单（Phase 1 签约时发出）

> 发给 workshop 填写。**分为「第一波必收」与「延后可选」两栏**——第一波只收基础运营需要的资料，其余等开对应模块再收，避免一次性吓跑客户。

### 1.1 店铺资料（必收）

| # | 资料 | 说明 | 字段 |
| --- | --- | --- | --- |
| 1 | 店名（法定/招牌） | 用于 Organisation 与 Invoice 抬头 | name |
| 2 | 主店 + 分店列表 | 每家：名称/城市/地址/电话/营业时间 | Branch[] |
| 3 | 币种 | 默认 MYR | currency |
| 4 | Logo / 招牌图 | 二维码物料、发票、海报用 | imageUrl |
| 5 | 联系人（老板/运营负责人） | 超管账号归属 | name/phone/email |

### 1.2 员工与角色（必收）

| # | 资料 | 说明 |
| --- | --- | --- |
| 1 | 员工名单：姓名 / 手机 / 邮箱 / 岗位 | 岗位决定角色（Owner / Manager / Counter / Mechanic / Inventory / Marketing / Accounting） |
| 2 | 每人是否开通登录 | 技师用 Mechanic App（接单/打卡/发薪）需要账号 |
| 3 | 排班/打卡方式 | 是否用 Attendance 打卡；技师是否按日结算发薪（Settlements） |

### 1.3 服务与套餐（必收）

| # | 资料 | 说明 | 示例 |
| --- | --- | --- | --- |
| 1 | 服务项目清单 | 名称 + 收费（RM）+ 工时 | Engine Oil Change RM45、Standard Service RM120、Major Service RM180 |
| 2 | 服务套餐（可选） | GOOD/BETTER/BEST 式套餐：名称 + 价格 + 包含项 | Standard RM120（含机油+检查） |
| 3 | 预约时段 | 每天可预约的时间槽 + 每槽上限 | 09:00/11:00/14:00/16:00，每槽 2 台 |
| 4 | 保养间隔 | 建议服务里程间隔（默认 3,000 km / 每月） | 3000 km |
| 5 | 检查清单模板 | 10 项标准检查（PASS/WARN/FAIL），可自定义 | 引擎油/滤芯/刹车/链条/轮胎… |

### 1.4 客户与车辆（必收，CSV 批量导入）

| # | 资料 | 模板列（见 §附录B） | 说明 |
| --- | --- | --- | --- |
| 1 | 客户名单 | name, phone, email, address | 手机号必填（通知/提醒用） |
| 2 | 车辆名单 | plate, brand, model, year, type, mileage | 一客户可多车 |
| 3 | 历史服务记录（可选） | date, service, mileage, amount | 建档让 Rider 服务历史连续 |

### 1.5 库存与供应商（视店铺情况，建议必收）

| # | 资料 | 说明 |
| --- | --- | --- |
| 1 | 常备配件/耗材清单 | SKU/名称/成本价/售价/安全库存（机油、滤芯、刹车片、链条、轮胎…） |
| 2 | 供应商名单 | 名称/联系人/电话/交期天数 |
| 3 | 当前盘点数量 | 首期库存快照 |

### 1.6 延后可选（开对应模块时再收）

| 模块 | 届时收集 |
| --- | --- |
| 销售线索 Leads/Pipeline | 是否卖新车；销售团队名单；线索来源渠道 |
| 营销 Campaigns | 促销计划、海报风格偏好、社媒账号 |
| 忠诚度 Loyalty | 积分规则、奖励方案 |
| 消息 Messaging | WhatsApp 企业号（或先用短信/应用内） |
| 集成 Integrations | OpenAI/Meta 账号与账单 |

---

## 2 · 模块开放策略（第一波：只开基础）

> 实现：权限系统支持按 **org × 角色 × 模块** 覆盖（src/lib/auth/permissions.ts 的 `can()`，DB Permission 表优先于默认矩阵）。
> 落地：上线脚本为指定 org 的角色批量写入 `canView=false` 覆盖行，导航（nav-registry 按 module view 过滤）与 URL 守卫自动隐藏/拦截。

### 2.1 第一波开放（基础运营闭环）

| 模块 | 理由 | 可见角色 |
| --- | --- | --- |
| DASHBOARD | 经营总览 | 全员 |
| CUSTOMERS / MOTORCYCLES | 客户档案 + 车辆护照 | Owner/Counter |
| BOOKINGS | 预约（Rider 下单 → 前台确认） | Owner/Counter |
| WORKSHOP / JOB_CARDS | 工单板 + 检查单 + 套餐 | Owner/Counter/Mechanic |
| REMINDERS | 保养提醒（核心价值） | Owner/Counter |
| NOTIFICATIONS | 站内通知 | 全员 |
| SETTINGS | 店铺配置 | Owner |
| USERS | 员工账号管理 | Owner |
| FINANCE | 收入/毛利看板（owner） | Owner/Accounting |
| TECHNICIANS | 打卡 + 结算 + KPI（技师用 Mechanic App） | Owner/Mechanic |
| PARTS / INVENTORY | 工单加件 + 库存（有备件的店） | Owner/Counter |

### 2.2 默认关闭（第二波再开）

| 模块 | 状态 | 重开条件 |
| --- | --- | --- |
| LEADS / PIPELINE / TEST_RIDES | 关闭 | 店铺做新车销售 |
| AUTOMATIONS | 关闭 | 运营稳定后自动化回访/任务 |
| CAMPAIGNS（日历/海报/脚本/评价） | 关闭 | 有营销团队 |
| LOYALTY / REFERRALS | 关闭 | 需要会员体系 |
| ANALYTICS | 关闭（owner 可按需开） | 要看深度报表 |
| MESSAGING（模板） | 关闭 | WhatsApp 集成换真后 |
| INTEGRATIONS | 关闭 | provider 换真后 |
| AI | 关闭 | OpenAI 接入后（当前 rule-based） |
| IMPORT（CSV 导入） | **上线期开**，迁移完关 | 数据迁移窗口用 |
| REPORTS | 关闭 | Accounting 需要时开 |

### 2.3 角色裁剪建议（第一波）

| 角色 | 开放范围 |
| --- | --- |
| OWNER | §2.1 全部 |
| COUNTER_STAFF | Dashboard/Customers/Motorcycles/Bookings/Jobs/Workshop/Inventory/AI（保持默认） |
| MECHANIC | Dashboard/Jobs/Mechanic Board/Checklists/KPI（保持默认） |
| 其他角色 | 第一波不建账号，需要时再加 |

---

## 3 · 初始化流程（Phase 1，1 周）

1. 发资料收集表（§附录A）→ 收表核对
2. 建 Organisation + Branch（含营业时间/地址/电话）
3. 建员工账号：Supabase Auth（email/password）+ User/Customer.authId 绑定 + JWT claims（orgId/branchId/role/userId）
4. 建服务目录（ServiceType）+ 套餐（ServicePackage）+ 预约时段（AppointmentSlot）
5. 配薪资规则（Organisation.salaryRules Json）+ 通知模板（MessageTemplate）
6. 执行模块覆盖脚本（§2：关闭默认关闭模块）
7. 本地 + 生产全流程冒烟（对照 DEMO_SCRIPT 20 步改真实数据）

## 4 · 数据迁移（Phase 2，3-5 天）

1. 客户/车辆 CSV（模板 §附录B）→ tsx 导入脚本（Prisma upsert；手机号查重）
2. 历史服务建档（可选）：生成 ServiceHistory / 首条 ServiceReminder
3. 库存：产品 + 盘点 + 供应商导入（沿用 PRODUCTS/SUPPLIERS 结构）
4. 验证：抽检 10 单对账；Rider 老客户登录能看到自己的车

## 5 · 品牌与集成（Phase 3，并行）

- 域名 / NEXT_PUBLIC_BASE_URL / Supabase Storage 同步（海报、附件）
- Logo / 主题色 / QR 物料（门店贴纸：Rider 注册 + 扫码）
- provider 换真：WhatsApp（Meta 企业验证）/ OpenAI（billing）——**Phase 0 硬前置**
- 备份策略：Supabase PITR + 定期导出；Sentry DSN

## 6 · 培训与试运行（Phase 4，2 周）

- 三端培训：Owner（看板/财务/提醒）、前台（预约/进店/发票/客户档案）、技师（Mechanic App 接单/打卡/发薪确认）
- 客户引导：老客户批量导入后发 WhatsApp/短信通知下载 Rider
- 试运行 1-2 周：纸面 + 系统并行，记录差异清单
- 上线日：清 demo 数据 → 导最终数据 → 全流程验收（E2E 指向真实店）→ 回滚预案（备份恢复）

---

## 附录A · 资料收集表（可直接发给 workshop）

```
【D&Z 上线资料收集表】店名：________  填表人：________  日期：________

一、店铺
1. 店名（招牌/法定）：________  2. 币种：MYR
3. 主店地址：________ 电话：________ 营业时间：________
4. 分店（如有）：名称/城市/地址/电话：________
5. Logo/招牌图：附件

二、员工（每行一人：姓名 | 手机 | 邮箱 | 岗位[老板/经理/前台/技师/仓管/财务/营销]）
________________________________________________
________________________________________________

三、服务与套餐
1. 服务项目（每行：名称 | 收费RM | 工时分钟）：
   Engine Oil Change | ___ | ___
   Standard Service | ___ | ___
   Major Service | ___ | ___
   （自行增删）
2. 套餐（如 GOOD/BETTER/BEST）：名称 | 价格 | 包含哪些服务
3. 可预约时段（如 09:00,11:00,14:00,16:00）：________ 每时段上限：___ 台
4. 保养间隔：___ km / ___ 个月
5. 检查清单模板是否需要自定义？默认 10 项可否？

四、库存（有备件则填）
1. 常备件清单（SKU或名称 | 成本RM | 售价RM | 安全库存）：另附 Excel
2. 供应商（名称 | 联系人 | 电话 | 交期天数）：
3. 当前库存盘点：另附 Excel

五、历史数据
1. 客户名单：另附 Excel（姓名/手机/邮箱/地址）
2. 车辆名单：另附 Excel（车主手机/车牌/品牌/型号/年份/类型/当前里程）
3. 历史服务记录（可选）：另附 Excel
```

## 附录B · CSV 导入模板列

| 表 | 列 |
| --- | --- |
| customers.csv | name, phone, email, address |
| motorcycles.csv | owner_phone, plate, brand, model, year, type(UNDERBONE/SCOOTER/NAKED/…), current_mileage |
| service_history.csv（可选） | owner_phone, plate, service_date(YYYY-MM-DD), service_name, mileage, amount_rm |
| products.csv | name, sku, category, brand, cost_rm, sell_rm, min_stock, lead_days |
| suppliers.csv | name, contact_name, phone, lead_time_days |

## 附录C · 上线检查清单

- [ ] 资料收集表收齐（§1.1-1.5）
- [ ] org/分店/员工账号建好，登录实测（三端）
- [ ] 服务/套餐/时段/薪资规则配置完成
- [ ] 模块覆盖脚本执行：第一波开放清单核对（导航只剩应见模块）
- [ ] 客户/车辆导入完成，抽检对账 10 单
- [ ] 库存/供应商导入完成（如适用）
- [ ] 品牌：域名/Logo/QR 物料就位
- [ ] WhatsApp/OpenAI 换真（Phase 0 前置）
- [ ] 试运行 1-2 周差异清单清零
- [ ] 上线日：清 demo → 导最终数据 → 全流程验收 → 备份/回滚预案
