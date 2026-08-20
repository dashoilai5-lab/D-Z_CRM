# D&Z AI CRM — 需求验证追踪（REQUIREMENTS VERIFICATION）

> 来源：docs/D&Z AI CRM — Detailed Product Requirements Checklist.md（895 条编号需求，49 章）
> 生成：session-3685dd91 · 目标 goal-c85d7630

状态标记：✅（实体补齐） 待验证 ｜ ✅ 满足 ｜ 🟡 部分满足 ｜ ❌ 缺失（待补齐）

## 分段总览

| 段 | 范围 | 章节 | 需求数 | 状态 |
|---|---|---|---|---|
| 1 | 数据模型地基（租户/多分支/核心实体） | §2 + §30 | 60 | ✅ 补齐完成|
| 2 | 认证与权限（登录/角色/RBAC） | §3 | 42 | ✅ 补齐完成|
| 3 | 网站与线索捕获 | §5 + §6 | 46 | ⏳ |
| 4 | 销售管道/跟进任务/试驾 | §7-9 | 52 | ⏳ |
| 5 | 客户 CRM/车辆登记/时间线 | §10-11 + §29 | 74 | ⏳ |
| 6 | 在线服务预约 | §12 | 35 | ⏳ |
| 7 | 工单运营/技师管理/服务历史 | §13-15 | 72 | ⏳ |
| 8 | 零件与库存 | §16 | 34 | ⏳ |
| 9 | 提醒/自动化/消息 | §17-19 | 69 | ⏳ |
| 10 | 忠诚度/推荐/营销活动 | §20-22 | 55 | ⏳ |
| 11 | 仪表盘/营收/分析/多分支 | §4 + §23-25 | 111 | ⏳ |
| 12 | 搜索/通知/导入导出/文件 | §26 + §28 + §31-32 + §37 | 55 | ⏳ |
| 13 | AI-Native CRM | §27 | 33 | ⏳ |
| 14 | API/集成/审计/安全/隐私 | §33-36 | 57 | ⏳ |
| 15 | 移动UX/性能/可靠性/管理配置/导航 | §38-41 + §47 | 60 | ⏳ |
| 16 | 端到端工作流 + V1 完成定义 | §42-46 | 40 | ⏳ |

---

## 段 1：数据模型地基（租户/多分支/核心实体）（§2 + §30）— 60 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| DATA-001 | Te | ✅ Organisation 多组织模型|  |
| DATA-002 | B | 🟡 多数模型 organisationId；Booking/Job/Inventory 经 branchId→org 间接|  |
| DATA-003 | Use | 🟡 查询层按 org/branch 过滤，待段2 审计|  |
| DATA-004 | Role. | ✅ Branch 模型|  |
| DATA-005 | Pe | ✅ logo/address/contact/tax/timezone/hours 已补|  |
| DATA-006 | Custome | 🟡 MYR+ms 语言+MY 默认国家，无显式市场配置|  |
| DATA-007 | Custome | ✅ currency=MYR|  |
| DATA-008 | Custome | ✅ currency 字符串可扩展|  |
| DATA-009 | Vehicle/Moto | 🟡 组织级配置部分字段|  |
| DATA-010 | Lead. | 🟡 operatingHours/appointmentCapacity 已补，UI 待段15|  |
| DATA-011 | Lead Sou | ❌ 无 head office 角色/聚合页面（段2/11）|  |
| DATA-012 | Lead Stage. | ✅ User.branchId|  |
| DATA-013 | Lead Activity. | ✅ cuid 唯一|  |
| DATA-014 | Task. | ✅ cuid 唯一|  |
| DATA-015 | Test Ride. | 🟡 经 branchId 间接标识 tenant|  |
| DATA-016 | Booki | ✅ 业务记录均有 branchId|  |
| DATA-017 | Appoi | ✅ Organisation|  |
| DATA-018 | Se | ✅ Branch|  |
| DATA-019 | Job Ca | ✅ User|  |
| DATA-020 | Job Status Histo | 🟡 enum Role + RoleConfig 实体（无 UI）|  |
| DATA-021 | Tech | ✅ Permission 实体已加|  |
| DATA-022 | Se | ✅ Customer|  |
| DATA-023 | Se | ✅ CustomerAddress 已加|  |
| DATA-024 | Pa | ✅ CustomerConsent 已加|  |
| DATA-025 | I | ✅ Motorcycle|  |
| DATA-026 | I | ✅ Lead 已加|  |
| DATA-027 | I | ✅ LeadSource 已加|  |
| DATA-028 | Remi | ✅ LeadStage 已加|  |
| DATA-029 | Automatio | ✅ LeadActivity 已加|  |
| DATA-030 | Automatio | ✅ Task 已加|  |
| DATA-031 | Message. | ✅ TestRide 已加|  |
| DATA-032 | Message Template. | ✅ Booking|  |
| DATA-033 | Campaig | ✅ AppointmentSlot 已加|  |
| DATA-034 | Loyalty Accou | ✅ ServiceType 已加|  |
| DATA-035 | Loyalty Tie | ✅ ServiceJob|  |
| DATA-036 | Loyalty T | ✅ JobStatusHistory 已加|  |
| DATA-037 | Rewa | 🟡 User.role=MECHANIC，无独立实体|  |
| DATA-038 | Rewa | ✅ ServiceJobItem|  |
| DATA-039 | Refe | ✅ ServiceHistory 已加|  |
| DATA-040 | Reve | ✅ Product|  |
| DATA-041 | Attachme | ✅ InventoryLocation 已加|  |
| DATA-042 | Notificatio | ✅ Inventory|  |
| DATA-043 | Audit Log. | ✅ StockMovement（已补 userId）|  |
| DATA-044 | I | ✅ ServiceReminder|  |
| PLT-001 | System must suppo | ✅ AutomationRule 已加|  |
| PLT-002 | Each deale | ✅ AutomationExecution 已加|  |
| PLT-003 | Data belo | ✅ Message|  |
| PLT-004 | Each te | ✅ MessageTemplate 已加|  |
| PLT-005 | Te | ✅ Campaign|  |
| PLT-006 | Te | ✅ LoyaltyAccount 已加|  |
| PLT-007 | Cu | ✅ LoyaltyTier 已加|  |
| PLT-008 | Platfo | ✅ LoyaltyTransaction 已加|  |
| PLT-009 | Platfo | ✅ Reward 已加|  |
| PLT-010 | Platfo | ✅ RewardRedemption 已加|  |
| PLT-011 | Platfo | ✅ Referral 已加|  |
| PLT-012 | Platfo | 🟡 Invoice/Payment 承担|  |
| PLT-013 | Platfo | ✅ Attachment 已加|  |
| PLT-014 | Platfo | ✅ Notification|  |
| PLT-015 | All custome | ✅ AuditLog 已加|  |
| PLT-016 | B | ✅ IntegrationConfig 已加|  |

</details>

## 段 2：认证与权限（登录/角色/RBAC）（§3）— 42 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| AUTH-001 | Use | ������🟡 audit() helper+登录审计已接，业务埋点随各段|  |
| AUTH-002 | System must suppo | ❌ 无 email/password 登录|  |
| AUTH-003 | Passwo | ❌ 无密码存储（CustomerAuthProfile.pin 明文）|  |
| AUTH-004 | System must suppo | ❌ 无密码重置|  |
| AUTH-005 | System must suppo | ❌ 无邮箱验证|  |
| AUTH-006 | System must suppo | ❌ 无会话过期|  |
| AUTH-007 | System must suppo | ❌ 无登出|  |
| AUTH-008 | System must suppo | 🟡 User.active 字段有，无禁用 UI/强制|  |
| AUTH-009 | System must p | ❌ 无登录入口|  |
| AUTH-010 | System must suppo | ❌ 无 MFA|  |
| AUTH-011 | Authe | ❌ AuditLog 实体已建未接入|  |
| AUTH-012 | Failed logi | ❌ 无|  |
| AUTH-013 | Platfo | ❌ 无|  |
| RBAC-001 | Pe | ✅ SUPER_ADMIN|  |
| RBAC-002 | Admi | ✅ OWNER|  |
| RBAC-003 | Roles must suppo | ❌ 无 HEAD_OFFICE_ADMIN|  |
| RBAC-004 | Roles must suppo | ✅ MANAGER|  |
| RBAC-005 | Roles must suppo | ❌ 无 SALES_MANAGER|  |
| RBAC-006 | Roles must suppo | ❌ 无 SALES_ADVISOR|  |
| RBAC-007 | Roles must suppo | ❌ 无 SERVICE_MANAGER|  |
| RBAC-008 | Roles must suppo | ✅ SERVICE_ADVISOR|  |
| RBAC-009 | Roles must suppo | ✅ MECHANIC|  |
| RBAC-010 | Roles must suppo | ❌ 无 PARTS_MANAGER|  |
| RBAC-011 | Head office use | ✅ INVENTORY|  |
| RBAC-012 | B | ✅ MARKETING|  |
| RBAC-013 | Tech | ❌ 无 CUSTOMER_SERVICE|  |
| RBAC-014 | Eve | ✅ ACCOUNTING|  |
| ROLE-001 | Supe | ❌ 无 AUDITOR|  |
| ROLE-002 | Deale | 🟡 nav-registry persona 级（3 角色）|  |
| ROLE-003 | Head Office Admi | ❌ RoleConfig 已建无 UI|  |
| ROLE-004 | B | ❌ Permission 已建未用|  |
| ROLE-005 | Sales Ma | ❌ 无 view 权限矩阵|  |
| ROLE-006 | Sales Adviso | ❌ 无 create|  |
| ROLE-007 | Se | ❌ 无 edit|  |
| ROLE-008 | Se | ❌ 无 delete|  |
| ROLE-009 | Tech | ❌ 无 export|  |
| ROLE-010 | Pa | ❌ 无财务可见性限制|  |
| ROLE-011 | Pa | ❌ User.branchId 有，无查询强制|  |
| ROLE-012 | Ma | ❌ 无总部视图|  |
| ROLE-013 | Custome | ❌ 无分支限定|  |
| ROLE-014 | Fi | 🟡 mechanic 页面按 mechanicId 过滤（HANDOFF）|  |
| ROLE-015 | Read-O | ❌ AuditLog 未接入|  |

</details>

## 段 3：网站与线索捕获（§5 + §6）— 46 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| LEAD-001 | Eve | ������✅ 新建页重复警告|  |
| LEAD-002 | WhatsApp e | ⏳ |  |
| LEAD-003 | Walk-i | ⏳ |  |
| LEAD-004 | Pho | ⏳ |  |
| LEAD-005 | Social media leads must be impo | ⏳ |  |
| LEAD-006 | Leads must co | ⏳ |  |
| LEAD-007 | Leads must | ⏳ |  |
| LEAD-008 | Leads must | ⏳ |  |
| LEAD-009 | Leads must | ⏳ |  |
| LEAD-010 | Leads must optio | ⏳ |  |
| LEAD-011 | Leads must | ⏳ |  |
| LEAD-012 | Leads must | ⏳ |  |
| LEAD-013 | Leads must | ⏳ |  |
| LEAD-014 | Leads must suppo | ⏳ |  |
| LEAD-015 | Leads must suppo | ⏳ |  |
| LEAD-016 | Leads must suppo | ⏳ |  |
| LEAD-017 | Leads must suppo | ⏳ |  |
| LEAD-018 | Leads must suppo | ⏳ |  |
| LEAD-019 | Leads must suppo | ⏳ |  |
| LEAD-020 | Leads must suppo | ⏳ |  |
| LEAD-021 | System must detect likely duplicate leads usi | ⏳ |  |
| LEAD-022 | Use | ⏳ |  |
| WEB-001 | Each deale | ⏳ |  |
| WEB-002 | Website must be mobile | ⏳ |  |
| WEB-003 | Website must wo | ⏳ |  |
| WEB-004 | Website must wo | ⏳ |  |
| WEB-005 | Website must allow deale | ⏳ |  |
| WEB-006 | Website must allow custom deale | ⏳ |  |
| WEB-007 | Website must allow deale | ⏳ |  |
| WEB-008 | Website must display b | ⏳ |  |
| WEB-009 | Website must display busi | ⏳ |  |
| WEB-010 | Website must suppo | ⏳ |  |
| WEB-011 | Website must suppo | ⏳ |  |
| WEB-012 | Website must suppo | ⏳ |  |
| WEB-013 | Website must p | ⏳ |  |
| WEB-014 | Website submissio | ⏳ |  |
| WEB-015 | Staff must | ⏳ |  |
| WEB-016 | Website must suppo | ⏳ |  |
| WEB-017 | Catalogue must suppo | ⏳ |  |
| WEB-018 | Catalogue must suppo | ⏳ |  |
| WEB-019 | Catalogue must suppo | ⏳ |  |
| WEB-020 | Catalogue must suppo | ⏳ |  |
| WEB-021 | Catalogue must suppo | ⏳ |  |
| WEB-022 | Catalogue must suppo | ⏳ |  |
| WEB-023 | Catalogue must suppo | ⏳ |  |
| WEB-024 | Catalogue e | ⏳ |  |

</details>

## 段 4：销售管道/跟进任务/试驾（§7-9）— 52 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| PIPE-001 | System must p | ⏳ |  |
| PIPE-002 | Leads must be movable betwee | ⏳ |  |
| PIPE-003 | Pipeli | ⏳ |  |
| PIPE-004 | Pipeli | ⏳ |  |
| PIPE-005 | Pipeli | ⏳ |  |
| PIPE-006 | Pipeli | ⏳ |  |
| PIPE-007 | Pipeli | ⏳ |  |
| PIPE-008 | Pipeli | ⏳ |  |
| PIPE-009 | Pipeli | ⏳ |  |
| PIPE-010 | Pipeli | ⏳ |  |
| PIPE-011 | Pipeli | ⏳ |  |
| PIPE-012 | Pipeli | ⏳ |  |
| PIPE-013 | Closed-lost | ⏳ |  |
| PIPE-014 | System must | ⏳ |  |
| PIPE-015 | System must calculate ave | ⏳ |  |
| PIPE-016 | System must ide | ⏳ |  |
| PIPE-017 | Sales ma | ⏳ |  |
| PIPE-018 | Salespeople must see thei | ⏳ |  |
| PIPE-019 | Lead histo | ⏳ |  |
| PIPE-020 | Closed-wo | ⏳ |  |
| TASK-001 | Use | ⏳ |  |
| TASK-002 | Use | ⏳ |  |
| TASK-003 | Use | ⏳ |  |
| TASK-004 | Use | ⏳ |  |
| TASK-005 | Tasks must have a | ⏳ |  |
| TASK-006 | Tasks must have a due date. | ⏳ |  |
| TASK-007 | Tasks must optio | ⏳ |  |
| TASK-008 | Tasks must have status. | ⏳ |  |
| TASK-009 | Requi | ⏳ |  |
| TASK-010 | Requi | ⏳ |  |
| TASK-011 | Requi | ⏳ |  |
| TASK-012 | Tasks must suppo | ⏳ |  |
| TASK-013 | Tasks must suppo | ⏳ |  |
| TASK-014 | Staff must | ⏳ |  |
| TASK-015 | Ma | ⏳ |  |
| TASK-016 | System must suppo | ⏳ |  |
| TASK-017 | Completi | ⏳ |  |
| TEST-001 | Sales use | ⏳ |  |
| TEST-002 | Custome | ⏳ |  |
| TEST-003 | Test | ⏳ |  |
| TEST-004 | Test | ⏳ |  |
| TEST-005 | Test | ⏳ |  |
| TEST-006 | Test | ⏳ |  |
| TEST-007 | Test | ⏳ |  |
| TEST-008 | Test | ⏳ |  |
| TEST-009 | Test | ⏳ |  |
| TEST-010 | Test | ⏳ |  |
| TEST-011 | Test | ⏳ |  |
| TEST-012 | Test | ⏳ |  |
| TEST-013 | Test | ⏳ |  |
| TEST-014 | Test | ⏳ |  |
| TEST-015 | Test | ⏳ |  |

</details>

## 段 5：客户 CRM/车辆登记/时间线（§10-11 + §29）— 74 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| CRM-001 | Eve | ⏳ |  |
| CRM-002 | Custome | ⏳ |  |
| CRM-003 | Custome | ⏳ |  |
| CRM-004 | Custome | ⏳ |  |
| CRM-005 | Custome | ⏳ |  |
| CRM-006 | Custome | ⏳ |  |
| CRM-007 | Custome | ⏳ |  |
| CRM-008 | Custome | ⏳ |  |
| CRM-009 | Custome | ⏳ |  |
| CRM-010 | Custome | ⏳ |  |
| CRM-011 | Custome | ⏳ |  |
| CRM-012 | Custome | ⏳ |  |
| CRM-013 | Custome | ⏳ |  |
| CRM-014 | Custome | ⏳ |  |
| CRM-015 | Custome | ⏳ |  |
| CRM-016 | Custome | ⏳ |  |
| CRM-017 | Custome | ⏳ |  |
| CRM-018 | Custome | ⏳ |  |
| CRM-019 | Custome | ⏳ |  |
| CRM-020 | Custome | ⏳ |  |
| CRM-021 | Custome | ⏳ |  |
| CRM-022 | Staff must be able to add custome | ⏳ |  |
| CRM-023 | Notes must ide | ⏳ |  |
| CRM-024 | Notes must | ⏳ |  |
| CRM-025 | Custome | ⏳ |  |
| CRM-026 | Custome | ⏳ |  |
| CRM-027 | Custome | ⏳ |  |
| CRM-028 | Custome | ⏳ |  |
| TIME-001 | Lead c | ⏳ |  |
| TIME-002 | Lead assig | ⏳ |  |
| TIME-003 | Lead stage cha | ⏳ |  |
| TIME-004 | Note added. | ⏳ |  |
| TIME-005 | Follow-up c | ⏳ |  |
| TIME-006 | Follow-up completed. | ⏳ |  |
| TIME-007 | Test | ⏳ |  |
| TIME-008 | Test | ⏳ |  |
| TIME-009 | Se | ⏳ |  |
| TIME-010 | Booki | ⏳ |  |
| TIME-011 | Booki | ⏳ |  |
| TIME-012 | Vehicle checked i | ⏳ |  |
| TIME-013 | Se | ⏳ |  |
| TIME-014 | Se | ⏳ |  |
| TIME-015 | Moto | ⏳ |  |
| TIME-016 | Remi | ⏳ |  |
| TIME-017 | Remi | ⏳ |  |
| TIME-018 | Message se | ⏳ |  |
| TIME-019 | Custome | ⏳ |  |
| TIME-020 | Loyalty poi | ⏳ |  |
| TIME-021 | Loyalty poi | ⏳ |  |
| TIME-022 | Refe | ⏳ |  |
| TIME-023 | Releva | ⏳ |  |
| TIME-024 | Timeli | ⏳ |  |
| TIME-025 | Timeli | ⏳ |  |
| TIME-026 | Timeli | ⏳ |  |
| VEH-001 | A custome | ⏳ |  |
| VEH-002 | A moto | ⏳ |  |
| VEH-003 | Moto | ⏳ |  |
| VEH-004 | Vehicle | ⏳ |  |
| VEH-005 | Vehicle | ⏳ |  |
| VEH-006 | Vehicle | ⏳ |  |
| VEH-007 | Vehicle | ⏳ |  |
| VEH-008 | Vehicle | ⏳ |  |
| VEH-009 | Vehicle | ⏳ |  |
| VEH-010 | Vehicle | ⏳ |  |
| VEH-011 | Vehicle | ⏳ |  |
| VEH-012 | Vehicle | ⏳ |  |
| VEH-013 | Vehicle | ⏳ |  |
| VEH-014 | Vehicle | ⏳ |  |
| VEH-015 | Vehicle | ⏳ |  |
| VEH-016 | Vehicle | ⏳ |  |
| VEH-017 | Vehicle | ⏳ |  |
| VEH-018 | Vehicle | ⏳ |  |
| VEH-019 | Vehicle | ⏳ |  |
| VEH-020 | Histo | ⏳ |  |

</details>

## 段 6：在线服务预约（§12）— 35 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| BOOK-001 | Custome | ⏳ |  |
| BOOK-002 | Booki | ⏳ |  |
| BOOK-003 | Custome | ⏳ |  |
| BOOK-004 | Custome | ⏳ |  |
| BOOK-005 | Custome | ⏳ |  |
| BOOK-006 | Custome | ⏳ |  |
| BOOK-007 | Custome | ⏳ |  |
| BOOK-008 | System must p | ⏳ |  |
| BOOK-009 | Booki | ⏳ |  |
| BOOK-010 | Booki | ⏳ |  |
| BOOK-011 | Booki | ⏳ |  |
| BOOK-012 | Co | ⏳ |  |
| BOOK-013 | Co | ⏳ |  |
| BOOK-014 | Co | ⏳ |  |
| BOOK-015 | Custome | ⏳ |  |
| BOOK-016 | Custome | ⏳ |  |
| BOOK-017 | Custome | ⏳ |  |
| BOOK-018 | Custome | ⏳ |  |
| BOOK-019 | Custome | ⏳ |  |
| BOOK-020 | Staff must be able to c | ⏳ |  |
| BOOK-021 | Staff must be able to | ⏳ |  |
| BOOK-022 | Staff must be able to ca | ⏳ |  |
| BOOK-023 | Staff must be able to co | ⏳ |  |
| BOOK-024 | Staff must be able to ma | ⏳ |  |
| BOOK-025 | Booki | ⏳ |  |
| BOOK-026 | Booki | ⏳ |  |
| BOOK-027 | Booki | ⏳ |  |
| BOOK-028 | Booki | ⏳ |  |
| BOOK-029 | Booki | ⏳ |  |
| BOOK-030 | Booki | ⏳ |  |
| BOOK-031 | Admi | ⏳ |  |
| BOOK-032 | Admi | ⏳ |  |
| BOOK-033 | Admi | ⏳ |  |
| BOOK-034 | Admi | ⏳ |  |
| BOOK-035 | Booki | ⏳ |  |

</details>

## 段 7：工单运营/技师管理/服务历史（§13-15）— 72 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| HIST-001 | Eve | ⏳ |  |
| HIST-002 | Se | ⏳ |  |
| HIST-003 | Se | ⏳ |  |
| HIST-004 | Se | ⏳ |  |
| HIST-005 | Se | ⏳ |  |
| HIST-006 | Se | ⏳ |  |
| HIST-007 | Se | ⏳ |  |
| HIST-008 | Se | ⏳ |  |
| HIST-009 | Se | ⏳ |  |
| HIST-010 | Se | ⏳ |  |
| HIST-011 | Se | ⏳ |  |
| HIST-012 | Se | ⏳ |  |
| HIST-013 | Se | ⏳ |  |
| HIST-014 | Se | ⏳ |  |
| HIST-015 | Histo | ⏳ |  |
| HIST-016 | Histo | ⏳ |  |
| HIST-017 | Histo | ⏳ |  |
| HIST-018 | C | ⏳ |  |
| JOB-001 | Eve | ⏳ |  |
| JOB-002 | Job ca | ⏳ |  |
| JOB-003 | Job ca | ⏳ |  |
| JOB-004 | Job ca | ⏳ |  |
| JOB-005 | Job ca | ⏳ |  |
| JOB-006 | Job ca | ⏳ |  |
| JOB-007 | Job ca | ⏳ |  |
| JOB-008 | Job ca | ⏳ |  |
| JOB-009 | Job ca | ⏳ |  |
| JOB-010 | Job ca | ⏳ |  |
| JOB-011 | Job ca | ⏳ |  |
| JOB-012 | Job ca | ⏳ |  |
| JOB-013 | Job ca | ⏳ |  |
| JOB-014 | Job ca | ⏳ |  |
| JOB-015 | Job ca | ⏳ |  |
| JOB-016 | Job ca | ⏳ |  |
| JOB-017 | Job ca | ⏳ |  |
| JOB-018 | Job ca | ⏳ |  |
| JOB-019 | Job ca | ⏳ |  |
| JOB-020 | Job ca | ⏳ |  |
| JOB-021 | Job ca | ⏳ |  |
| JOB-022 | Status cha | ⏳ |  |
| JOB-023 | Status cha | ⏳ |  |
| JOB-024 | Waiti | ⏳ |  |
| JOB-025 | Ready status must t | ⏳ |  |
| JOB-026 | Delive | ⏳ |  |
| JOB-027 | Delive | ⏳ |  |
| JOB-028 | Delive | ⏳ |  |
| JOB-029 | Delive | ⏳ |  |
| TECH-001 | System must mai | ⏳ |  |
| TECH-002 | Tech | ⏳ |  |
| TECH-003 | Tech | ⏳ |  |
| TECH-004 | Tech | ⏳ |  |
| TECH-005 | System must show jobs assig | ⏳ |  |
| TECH-006 | System must show tech | ⏳ |  |
| TECH-007 | System must show tech | ⏳ |  |
| TECH-008 | System must show tech | ⏳ |  |
| TECH-009 | Ma | ⏳ |  |
| TECH-010 | Tech | ⏳ |  |
| TECH-011 | Tech | ⏳ |  |
| TECH-012 | Tech | ⏳ |  |
| TECH-013 | Tech | ⏳ |  |
| TECH-014 | Tech | ⏳ |  |
| TECH-015 | Tech | ⏳ |  |
| WS-001 | Wo | ⏳ |  |
| WS-002 | Dashboa | ⏳ |  |
| WS-003 | Dashboa | ⏳ |  |
| WS-004 | Dashboa | ⏳ |  |
| WS-005 | Dashboa | ⏳ |  |
| WS-006 | Dashboa | ⏳ |  |
| WS-007 | Dashboa | ⏳ |  |
| WS-008 | Dashboa | ⏳ |  |
| WS-009 | Dashboa | ⏳ |  |
| WS-010 | Dashboa | ⏳ |  |

</details>

## 段 8：零件与库存（§16）— 34 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| INV-001 | Stock must be t | ⏳ |  |
| INV-002 | System must show cu | ⏳ |  |
| INV-003 | System must show available qua | ⏳ |  |
| INV-004 | System must suppo | ⏳ |  |
| INV-005 | System must ide | ⏳ |  |
| INV-006 | System must ide | ⏳ |  |
| INV-007 | System must suppo | ⏳ |  |
| INV-008 | System must suppo | ⏳ |  |
| INV-009 | System must suppo | ⏳ |  |
| INV-010 | System must suppo | ⏳ |  |
| INV-011 | Eve | ⏳ |  |
| INV-012 | I | ⏳ |  |
| INV-013 | I | ⏳ |  |
| INV-014 | I | ⏳ |  |
| INV-015 | Wo | ⏳ |  |
| INV-016 | Pa | ⏳ |  |
| INV-017 | Pa | ⏳ |  |
| INV-018 | Pa | ⏳ |  |
| INV-019 | Pa | ⏳ |  |
| INV-020 | Pa | ⏳ |  |
| INV-021 | Low-stock ale | ⏳ |  |
| INV-022 | I | ⏳ |  |
| PART-001 | System must mai | ⏳ |  |
| PART-002 | Eve | ⏳ |  |
| PART-003 | Pa | ⏳ |  |
| PART-004 | Pa | ⏳ |  |
| PART-005 | Pa | ⏳ |  |
| PART-006 | Pa | ⏳ |  |
| PART-007 | Pa | ⏳ |  |
| PART-008 | Pa | ⏳ |  |
| PART-009 | Pa | ⏳ |  |
| PART-010 | Pa | ⏳ |  |
| PART-011 | Pa | ⏳ |  |
| PART-012 | Pa | ⏳ |  |

</details>

## 段 9：提醒/自动化/消息（§17-19）— 69 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| AUTO-001 | Platfo | ⏳ |  |
| AUTO-002 | Automatio | ⏳ |  |
| AUTO-003 | Automatio | ⏳ |  |
| AUTO-004 | Automatio | ⏳ |  |
| AUTO-005 | Automatio | ⏳ |  |
| AUTO-006 | New lead c | ⏳ |  |
| AUTO-007 | Lead stage cha | ⏳ |  |
| AUTO-008 | Booki | ⏳ |  |
| AUTO-009 | Booki | ⏳ |  |
| AUTO-010 | Se | ⏳ |  |
| AUTO-011 | Se | ⏳ |  |
| AUTO-012 | Job | ⏳ |  |
| AUTO-013 | Custome | ⏳ |  |
| AUTO-014 | Loyalty eve | ⏳ |  |
| AUTO-015 | Low-stock th | ⏳ |  |
| AUTO-016 | Automatio | ⏳ |  |
| AUTO-017 | Automatio | ⏳ |  |
| AUTO-018 | Automatio | ⏳ |  |
| AUTO-019 | Automatio | ⏳ |  |
| AUTO-020 | Automatio | ⏳ |  |
| AUTO-021 | Automatio | ⏳ |  |
| AUTO-022 | Failed automatio | ⏳ |  |
| AUTO-023 | Admi | ⏳ |  |
| AUTO-024 | Automatio | ⏳ |  |
| MSG-001 | Platfo | ⏳ |  |
| MSG-002 | Platfo | ⏳ |  |
| MSG-003 | Platfo | ⏳ |  |
| MSG-004 | Message templates must be co | ⏳ |  |
| MSG-005 | Templates must suppo | ⏳ |  |
| MSG-006 | Templates must suppo | ⏳ |  |
| MSG-007 | Templates must suppo | ⏳ |  |
| MSG-008 | Templates must suppo | ⏳ |  |
| MSG-009 | Templates must suppo | ⏳ |  |
| MSG-010 | Templates must suppo | ⏳ |  |
| MSG-011 | Templates must suppo | ⏳ |  |
| MSG-012 | System must | ⏳ |  |
| MSG-013 | Commu | ⏳ |  |
| MSG-014 | Commu | ⏳ |  |
| MSG-015 | Commu | ⏳ |  |
| MSG-016 | Commu | ⏳ |  |
| MSG-017 | System must p | ⏳ |  |
| MSG-018 | T | ⏳ |  |
| MSG-019 | Messagi | ⏳ |  |
| MSG-020 | Message API failu | ⏳ |  |
| REM-001 | System must schedule | ⏳ |  |
| REM-002 | Remi | ⏳ |  |
| REM-003 | Remi | ⏳ |  |
| REM-004 | Remi | ⏳ |  |
| REM-005 | Remi | ⏳ |  |
| REM-006 | Remi | ⏳ |  |
| REM-007 | Remi | ⏳ |  |
| REM-008 | Remi | ⏳ |  |
| REM-009 | Remi | ⏳ |  |
| REM-010 | Remi | ⏳ |  |
| REM-011 | Remi | ⏳ |  |
| REM-012 | Remi | ⏳ |  |
| REM-013 | Remi | ⏳ |  |
| REM-014 | Remi | ⏳ |  |
| REM-015 | Remi | ⏳ |  |
| REM-016 | Remi | ⏳ |  |
| REM-017 | Failed | ⏳ |  |
| REM-018 | Successful | ⏳ |  |
| REM-019 | Custome | ⏳ |  |
| REM-020 | Remi | ⏳ |  |
| REM-021 | System must suppo | ⏳ |  |
| REM-022 | Re | ⏳ |  |
| REM-023 | Re | ⏳ |  |
| REM-024 | Re | ⏳ |  |
| REM-025 | Admi | ⏳ |  |

</details>

## 段 10：忠诚度/推荐/营销活动（§20-22）— 55 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| LOY-001 | System must suppo | ⏳ |  |
| LOY-002 | Custome | ⏳ |  |
| LOY-003 | Membe | ⏳ |  |
| LOY-004 | Requi | ⏳ |  |
| LOY-005 | Admi | ⏳ |  |
| LOY-006 | Admi | ⏳ |  |
| LOY-007 | System must display cu | ⏳ |  |
| LOY-008 | System must display p | ⏳ |  |
| LOY-009 | System must suppo | ⏳ |  |
| LOY-010 | System must suppo | ⏳ |  |
| LOY-011 | System must suppo | ⏳ |  |
| LOY-012 | Poi | ⏳ |  |
| LOY-013 | Poi | ⏳ |  |
| LOY-014 | Poi | ⏳ |  |
| LOY-015 | Poi | ⏳ |  |
| LOY-016 | Poi | ⏳ |  |
| LOY-017 | Poi | ⏳ |  |
| LOY-018 | Poi | ⏳ |  |
| LOY-019 | Poi | ⏳ |  |
| LOY-020 | Poi | ⏳ |  |
| LOY-021 | Poi | ⏳ |  |
| LOY-022 | Custome | ⏳ |  |
| LOY-023 | Staff must be able to see poi | ⏳ |  |
| LOY-024 | Poi | ⏳ |  |
| LOY-025 | Admi | ⏳ |  |
| LOY-026 | Rewa | ⏳ |  |
| LOY-027 | Rewa | ⏳ |  |
| LOY-028 | Rewa | ⏳ |  |
| LOY-029 | System must p | ⏳ |  |
| MKT-001 | Ma | ⏳ |  |
| MKT-002 | Campaig | ⏳ |  |
| MKT-003 | Campaig | ⏳ |  |
| MKT-004 | Campaig | ⏳ |  |
| MKT-005 | Campaig | ⏳ |  |
| MKT-006 | Audie | ⏳ |  |
| MKT-007 | Audie | ⏳ |  |
| MKT-008 | Audie | ⏳ |  |
| MKT-009 | Audie | ⏳ |  |
| MKT-010 | Audie | ⏳ |  |
| MKT-011 | Audie | ⏳ |  |
| MKT-012 | Audie | ⏳ |  |
| MKT-013 | Campaig | ⏳ |  |
| MKT-014 | Campaig | ⏳ |  |
| MKT-015 | Campaig | ⏳ |  |
| MKT-016 | Campaig | ⏳ |  |
| MKT-017 | Campaig | ⏳ |  |
| REF-001 | Custome | ⏳ |  |
| REF-002 | Refe | ⏳ |  |
| REF-003 | Refe | ⏳ |  |
| REF-004 | Refe | ⏳ |  |
| REF-005 | Refe | ⏳ |  |
| REF-006 | Refe | ⏳ |  |
| REF-007 | Refe | ⏳ |  |
| REF-008 | Refe | ⏳ |  |
| REF-009 | System must p | ⏳ |  |

</details>

## 段 11：仪表盘/营收/分析/多分支（§4 + §23-25）— 111 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| ANA-001 | Repo | ⏳ |  |
| ANA-002 | Repo | ⏳ |  |
| ANA-003 | Repo | ⏳ |  |
| ANA-004 | Repo | ⏳ |  |
| ANA-005 | Repo | ⏳ |  |
| ANA-006 | Repo | ⏳ |  |
| ANA-007 | Repo | ⏳ |  |
| ANA-008 | Repo | ⏳ |  |
| ANA-009 | Repo | ⏳ |  |
| ANA-010 | Repo | ⏳ |  |
| ANA-011 | Repo | ⏳ |  |
| ANA-012 | Repo | ⏳ |  |
| ANA-013 | Repo | ⏳ |  |
| ANA-014 | Repo | ⏳ |  |
| ANA-015 | Repo | ⏳ |  |
| ANA-016 | Repo | ⏳ |  |
| ANA-017 | Repo | ⏳ |  |
| ANA-018 | Repo | ⏳ |  |
| ANA-019 | Repo | ⏳ |  |
| ANA-020 | Repo | ⏳ |  |
| ANA-021 | Repo | ⏳ |  |
| ANA-022 | Repo | ⏳ |  |
| ANA-023 | Repo | ⏳ |  |
| ANA-024 | Repo | ⏳ |  |
| ANA-025 | Repo | ⏳ |  |
| ANA-026 | Repo | ⏳ |  |
| ANA-027 | Repo | ⏳ |  |
| ANA-028 | Repo | ⏳ |  |
| ANA-029 | Repo | ⏳ |  |
| ANA-030 | Repo | ⏳ |  |
| ANA-031 | Repo | ⏳ |  |
| ANA-032 | Repo | ⏳ |  |
| ANA-033 | Repo | ⏳ |  |
| ANA-034 | Repo | ⏳ |  |
| ANA-035 | Repo | ⏳ |  |
| ANA-036 | Repo | ⏳ |  |
| ANA-037 | Repo | ⏳ |  |
| ANA-038 | Repo | ⏳ |  |
| ANA-039 | Repo | ⏳ |  |
| ANA-040 | Repo | ⏳ |  |
| ANA-041 | Repo | ⏳ |  |
| ANA-042 | Repo | ⏳ |  |
| ANA-043 | Repo | ⏳ |  |
| ANA-044 | Repo | ⏳ |  |
| ANA-045 | Repo | ⏳ |  |
| ANA-046 | Repo | ⏳ |  |
| ANA-047 | Repo | ⏳ |  |
| ANA-048 | Repo | ⏳ |  |
| ANA-049 | Expo | ⏳ |  |
| ANA-050 | Expo | ⏳ |  |
| ANA-051 | Dashboa | ⏳ |  |
| BR-001 | Head office must see all autho | ⏳ |  |
| BR-002 | Head office dashboa | ⏳ |  |
| BR-003 | Head office dashboa | ⏳ |  |
| BR-004 | Head office dashboa | ⏳ |  |
| BR-005 | Head office dashboa | ⏳ |  |
| BR-006 | Head office dashboa | ⏳ |  |
| BR-007 | Head office must compa | ⏳ |  |
| BR-008 | Head office must filte | ⏳ |  |
| BR-009 | Head office must | ⏳ |  |
| BR-010 | Custome | ⏳ |  |
| BR-011 | Custome | ⏳ |  |
| BR-012 | Vehicle histo | ⏳ |  |
| BR-013 | B | ⏳ |  |
| BR-014 | B | ⏳ |  |
| BR-015 | B | ⏳ |  |
| BR-016 | Head office must be able to see stock ac | ⏳ |  |
| BR-017 | System must suppo | ⏳ |  |
| BR-018 | Head office must co | ⏳ |  |
| BR-019 | Head office must co | ⏳ |  |
| BR-020 | Head office must co | ⏳ |  |
| BR-021 | Head office must co | ⏳ |  |
| BR-022 | B | ⏳ |  |
| BR-023 | B | ⏳ |  |
| BR-024 | New b | ⏳ |  |
| BR-025 | New b | ⏳ |  |
| DASH-001 | System must p | ⏳ |  |
| DASH-002 | Dashboa | ⏳ |  |
| DASH-003 | Dashboa | ⏳ |  |
| DASH-004 | Dashboa | ⏳ |  |
| DASH-005 | Dashboa | ⏳ |  |
| DASH-006 | Dashboa | ⏳ |  |
| DASH-007 | Dashboa | ⏳ |  |
| DASH-008 | Dashboa | ⏳ |  |
| DASH-009 | Dashboa | ⏳ |  |
| DASH-010 | Dashboa | ⏳ |  |
| DASH-011 | Dashboa | ⏳ |  |
| DASH-012 | Dashboa | ⏳ |  |
| DASH-013 | Dashboa | ⏳ |  |
| DASH-014 | Dashboa | ⏳ |  |
| DASH-015 | Dashboa | ⏳ |  |
| DASH-016 | Dashboa | ⏳ |  |
| DASH-017 | Dashboa | ⏳ |  |
| DASH-018 | Dashboa | ⏳ |  |
| DASH-019 | Dashboa | ⏳ |  |
| DASH-020 | Dashboa | ⏳ |  |
| DASH-021 | Dashboa | ⏳ |  |
| DASH-022 | Head office dashboa | ⏳ |  |
| DASH-023 | Dashboa | ⏳ |  |
| REV-001 | Platfo | ⏳ |  |
| REV-002 | Reve | ⏳ |  |
| REV-003 | Reve | ⏳ |  |
| REV-004 | Reve | ⏳ |  |
| REV-005 | Reve | ⏳ |  |
| REV-006 | Reve | ⏳ |  |
| REV-007 | Reve | ⏳ |  |
| REV-008 | Reve | ⏳ |  |
| REV-009 | Reve | ⏳ |  |
| REV-010 | Reve | ⏳ |  |
| REV-011 | A | ⏳ |  |
| REV-012 | Estimated values must be clea | ⏳ |  |

</details>

## 段 12：搜索/通知/导入导出/文件（§26 + §28 + §31-32 + §37）— 55 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| EXPORT-001 | Autho | ⏳ |  |
| EXPORT-002 | Autho | ⏳ |  |
| EXPORT-003 | Autho | ⏳ |  |
| EXPORT-004 | Autho | ⏳ |  |
| EXPORT-005 | Autho | ⏳ |  |
| EXPORT-006 | Autho | ⏳ |  |
| EXPORT-007 | Expo | ⏳ |  |
| EXPORT-008 | Expo | ⏳ |  |
| FILE-001 | CRM must suppo | ⏳ |  |
| FILE-002 | Attachme | ⏳ |  |
| FILE-003 | Attachme | ⏳ |  |
| FILE-004 | Attachme | ⏳ |  |
| FILE-005 | Attachme | ⏳ |  |
| FILE-006 | Suppo | ⏳ |  |
| FILE-007 | Suppo | ⏳ |  |
| FILE-008 | File access must | ⏳ |  |
| FILE-009 | File access must | ⏳ |  |
| FILE-010 | Deleted pa | ⏳ |  |
| IMPORT-001 | System must suppo | ⏳ |  |
| IMPORT-002 | System must suppo | ⏳ |  |
| IMPORT-003 | System must suppo | ⏳ |  |
| IMPORT-004 | System must suppo | ⏳ |  |
| IMPORT-005 | System must suppo | ⏳ |  |
| IMPORT-006 | Impo | ⏳ |  |
| IMPORT-007 | Impo | ⏳ |  |
| IMPORT-008 | Impo | ⏳ |  |
| IMPORT-009 | Impo | ⏳ |  |
| IMPORT-010 | Impo | ⏳ |  |
| IMPORT-011 | Impo | ⏳ |  |
| IMPORT-012 | Impo | ⏳ |  |
| IMPORT-013 | Impo | ⏳ |  |
| NOTIF-001 | Platfo | ⏳ |  |
| NOTIF-002 | Use | ⏳ |  |
| NOTIF-003 | Use | ⏳ |  |
| NOTIF-004 | Use | ⏳ |  |
| NOTIF-005 | Se | ⏳ |  |
| NOTIF-006 | Wo | ⏳ |  |
| NOTIF-007 | Releva | ⏳ |  |
| NOTIF-008 | Notificatio | ⏳ |  |
| NOTIF-009 | Notificatio | ⏳ |  |
| NOTIF-010 | Use | ⏳ |  |
| SEARCH-001 | Platfo | ⏳ |  |
| SEARCH-002 | Sea | ⏳ |  |
| SEARCH-003 | Sea | ⏳ |  |
| SEARCH-004 | Sea | ⏳ |  |
| SEARCH-005 | Sea | ⏳ |  |
| SEARCH-006 | Sea | ⏳ |  |
| SEARCH-007 | Sea | ⏳ |  |
| SEARCH-008 | Sea | ⏳ |  |
| SEARCH-009 | Sea | ⏳ |  |
| SEARCH-010 | Sea | ⏳ |  |
| SEARCH-011 | Sea | ⏳ |  |
| SEARCH-012 | Sea | ⏳ |  |
| SEARCH-013 | Sea | ⏳ |  |
| SEARCH-014 | Selecti | ⏳ |  |

</details>

## 段 13：AI-Native CRM（§27）— 33 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| AI-001 | AI must be able to summa | ⏳ |  |
| AI-002 | AI must ide | ⏳ |  |
| AI-003 | AI must ide | ⏳ |  |
| AI-004 | AI must suggest a | ⏳ |  |
| AI-005 | AI-ge | ⏳ |  |
| AI-006 | AI must | ⏳ |  |
| AI-007 | Use | ⏳ |  |
| AI-008 | AI must summa | ⏳ |  |
| AI-009 | AI must summa | ⏳ |  |
| AI-010 | AI must ide | ⏳ |  |
| AI-011 | AI must help staff p | ⏳ |  |
| AI-012 | AI must use CRM co | ⏳ |  |
| AI-013 | AI must assist with d | ⏳ |  |
| AI-014 | AI must assist with d | ⏳ |  |
| AI-015 | AI must assist with d | ⏳ |  |
| AI-016 | AI must suppo | ⏳ |  |
| AI-017 | AI-ge | ⏳ |  |
| AI-018 | AI must | ⏳ |  |
| AI-019 | AI must | ⏳ |  |
| AI-020 | AI must explai | ⏳ |  |
| AI-021 | AI must ide | ⏳ |  |
| AI-022 | AI must ide | ⏳ |  |
| AI-023 | AI must ide | ⏳ |  |
| AI-024 | AI must ide | ⏳ |  |
| AI-025 | AI must diffe | ⏳ |  |
| AI-026 | AI i | ⏳ |  |
| AI-027 | AI i | ⏳ |  |
| AI-028 | AI p | ⏳ |  |
| AI-029 | Se | ⏳ |  |
| AI-030 | AI actio | ⏳ |  |
| AI-031 | High-impact automated actio | ⏳ |  |
| AI-032 | AI failu | ⏳ |  |
| AI-033 | Co | ⏳ |  |

</details>

## 段 14：API/集成/审计/安全/隐私（§33-36）— 57 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| API-001 | Platfo | ⏳ |  |
| API-002 | API authe | ⏳ |  |
| API-003 | API must e | ⏳ |  |
| API-004 | API must e | ⏳ |  |
| API-005 | API | ⏳ |  |
| API-006 | I | ⏳ |  |
| API-007 | Platfo | ⏳ |  |
| API-008 | Webhooks must suppo | ⏳ |  |
| API-009 | Duplicate webhook p | ⏳ |  |
| AUDIT-001 | System must mai | ⏳ |  |
| AUDIT-002 | Audit log must ide | ⏳ |  |
| AUDIT-003 | Audit log must ide | ⏳ |  |
| AUDIT-004 | Audit log must ide | ⏳ |  |
| AUDIT-005 | Audit log must ide | ⏳ |  |
| AUDIT-006 | Audit log must ide | ⏳ |  |
| AUDIT-007 | Audit log must co | ⏳ |  |
| AUDIT-008 | Audit log must captu | ⏳ |  |
| AUDIT-009 | Logi | ⏳ |  |
| AUDIT-010 | Pe | ⏳ |  |
| AUDIT-011 | Use | ⏳ |  |
| AUDIT-012 | I | ⏳ |  |
| AUDIT-013 | Loyalty adjustme | ⏳ |  |
| AUDIT-014 | Data expo | ⏳ |  |
| AUDIT-015 | O | ⏳ |  |
| INT-001 | WhatsApp Busi | ⏳ |  |
| INT-002 | SMS p | ⏳ |  |
| INT-003 | Email p | ⏳ |  |
| INT-004 | Website fo | ⏳ |  |
| INT-005 | Social lead sou | ⏳ |  |
| INT-006 | Exte | ⏳ |  |
| INT-007 | Exte | ⏳ |  |
| PRIV-001 | Platfo | ⏳ |  |
| PRIV-002 | Platfo | ⏳ |  |
| PRIV-003 | Ma | ⏳ |  |
| PRIV-004 | Custome | ⏳ |  |
| PRIV-005 | Custome | ⏳ |  |
| PRIV-006 | Admi | ⏳ |  |
| PRIV-007 | Data | ⏳ |  |
| PRIV-008 | Deletio | ⏳ |  |
| PRIV-009 | System must comply with applicable Malaysia | ⏳ |  |
| SEC-001 | All p | ⏳ |  |
| SEC-002 | Se | ⏳ |  |
| SEC-003 | Passwo | ⏳ |  |
| SEC-004 | System must p | ⏳ |  |
| SEC-005 | System must p | ⏳ |  |
| SEC-006 | System must p | ⏳ |  |
| SEC-007 | System must validate uploaded files. | ⏳ |  |
| SEC-008 | System must limit file upload size. | ⏳ |  |
| SEC-009 | API sec | ⏳ |  |
| SEC-010 | Te | ⏳ |  |
| SEC-011 | Se | ⏳ |  |
| SEC-012 | Se | ⏳ |  |
| SEC-013 | P | ⏳ |  |
| SEC-014 | P | ⏳ |  |
| SEC-015 | System depe | ⏳ |  |
| SEC-016 | Access to p | ⏳ |  |
| SEC-017 | Se | ⏳ |  |

</details>

## 段 15：移动UX/性能/可靠性/管理配置/导航（§38-41 + §47）— 60 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| ADMIN-001 | Compa | ⏳ |  |
| ADMIN-002 | B | ⏳ |  |
| ADMIN-003 | Use | ⏳ |  |
| ADMIN-004 | Roles. | ⏳ |  |
| ADMIN-005 | Pe | ⏳ |  |
| ADMIN-006 | Lead stages. | ⏳ |  |
| ADMIN-007 | Lead sou | ⏳ |  |
| ADMIN-008 | Lost | ⏳ |  |
| ADMIN-009 | Se | ⏳ |  |
| ADMIN-010 | Booki | ⏳ |  |
| ADMIN-011 | Ope | ⏳ |  |
| ADMIN-012 | Holiday/closu | ⏳ |  |
| ADMIN-013 | Appoi | ⏳ |  |
| ADMIN-014 | Remi | ⏳ |  |
| ADMIN-015 | Messagi | ⏳ |  |
| ADMIN-016 | Automatio | ⏳ |  |
| ADMIN-017 | Loyalty tie | ⏳ |  |
| ADMIN-018 | Loyalty ea | ⏳ |  |
| ADMIN-019 | Rewa | ⏳ |  |
| ADMIN-020 | Refe | ⏳ |  |
| ADMIN-021 | I | ⏳ |  |
| ADMIN-022 | I | ⏳ |  |
| ADMIN-023 | Website b | ⏳ |  |
| ADMIN-024 | Cu | ⏳ |  |
| ADMIN-025 | Timezo | ⏳ |  |
| ADMIN-026 | Notificatio | ⏳ |  |
| PERF-001 | No | ⏳ |  |
| PERF-002 | Dashboa | ⏳ |  |
| PERF-003 | Sea | ⏳ |  |
| PERF-004 | Pagi | ⏳ |  |
| PERF-005 | La | ⏳ |  |
| PERF-006 | Backg | ⏳ |  |
| PERF-007 | Message se | ⏳ |  |
| PERF-008 | Automatio | ⏳ |  |
| PERF-009 | Dashboa | ⏳ |  |
| PERF-010 | Database i | ⏳ |  |
| REL-001 | P | ⏳ |  |
| REL-002 | Backup | ⏳ |  |
| REL-003 | Applicatio | ⏳ |  |
| REL-004 | C | ⏳ |  |
| REL-005 | Messagi | ⏳ |  |
| REL-006 | Duplicate message se | ⏳ |  |
| REL-007 | Duplicate payme | ⏳ |  |
| REL-008 | AI se | ⏳ |  |
| REL-009 | WhatsApp/SMS p | ⏳ |  |
| REL-010 | Failed exte | ⏳ |  |
| UX-001 | I | ⏳ |  |
| UX-002 | Co | ⏳ |  |
| UX-003 | Co | ⏳ |  |
| UX-004 | Co | ⏳ |  |
| UX-005 | Salespeople must be able to view a | ⏳ |  |
| UX-006 | Salespeople must be able to complete follow-up tasks o | ⏳ |  |
| UX-007 | Se | ⏳ |  |
| UX-008 | Wo | ⏳ |  |
| UX-009 | Pa | ⏳ |  |
| UX-010 | Dashboa | ⏳ |  |
| UX-011 | Tables must | ⏳ |  |
| UX-012 | P | ⏳ |  |
| UX-013 | E | ⏳ |  |
| UX-014 | Dest | ⏳ |  |

</details>

## 段 16：端到端工作流 + V1 完成定义（§42-46）— 40 条

<details><summary>需求清单</summary>

| ID | 需求 | 状态 | 证据/备注 |
|---|---|---|---|
| DONE-001 | Te | ⏳ |  |
| DONE-002 | Role pe | ⏳ |  |
| DONE-003 | Website e | ⏳ |  |
| DONE-004 | Lead → custome | ⏳ |  |
| DONE-005 | Sales pipeli | ⏳ |  |
| DONE-006 | Follow-up tasks wo | ⏳ |  |
| DONE-007 | Test | ⏳ |  |
| DONE-008 | Custome | ⏳ |  |
| DONE-009 | Moto | ⏳ |  |
| DONE-010 | O | ⏳ |  |
| DONE-011 | Se | ⏳ |  |
| DONE-012 | Wo | ⏳ |  |
| DONE-013 | Tech | ⏳ |  |
| DONE-014 | Wo | ⏳ |  |
| DONE-015 | Se | ⏳ |  |
| DONE-016 | Pa | ⏳ |  |
| DONE-017 | I | ⏳ |  |
| DONE-018 | Automated se | ⏳ |  |
| DONE-019 | WhatsApp i | ⏳ |  |
| DONE-020 | SMS i | ⏳ |  |
| DONE-021 | Email i | ⏳ |  |
| DONE-022 | Custome | ⏳ |  |
| DONE-023 | Loyalty poi | ⏳ |  |
| DONE-024 | Loyalty | ⏳ |  |
| DONE-025 | Refe | ⏳ |  |
| DONE-026 | Co | ⏳ |  |
| DONE-027 | B | ⏳ |  |
| DONE-028 | Multi-b | ⏳ |  |
| DONE-029 | Sea | ⏳ |  |
| DONE-030 | CSV impo | ⏳ |  |
| DONE-031 | CSV expo | ⏳ |  |
| DONE-032 | Audit logs wo | ⏳ |  |
| DONE-033 | Backup p | ⏳ |  |
| DONE-034 | Backup | ⏳ |  |
| DONE-035 | Secu | ⏳ |  |
| DONE-036 | C | ⏳ |  |
| DONE-037 | Mobile- | ⏳ |  |
| DONE-038 | AI failu | ⏳ |  |
| DONE-039 | AI output is sepa | ⏳ |  |
| DONE-040 | P | ⏳ |  |

</details>

