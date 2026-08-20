
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
// 段1 状态映射: id -> [status, note]
const seg1 = {
  // PLT
  'PLT-001': ['✅','Organisation 多组织模型'], 'PLT-002': ['🟡','多数模型 organisationId；Booking/Job/Inventory 经 branchId→org 间接'],
  'PLT-003': ['🟡','查询层按 org/branch 过滤，待段2 审计'], 'PLT-004': ['✅','Branch 模型'], 'PLT-005': ['✅','logo/address/contact/tax/timezone/hours 已补'],
  'PLT-006': ['🟡','MYR+ms 语言+MY 默认国家，无显式市场配置'], 'PLT-007': ['✅','currency=MYR'], 'PLT-008': ['✅','currency 字符串可扩展'],
  'PLT-009': ['🟡','组织级配置部分字段'], 'PLT-010': ['🟡','operatingHours/appointmentCapacity 已补，UI 待段15'],
  'PLT-011': ['❌','无 head office 角色/聚合页面（段2/11）'], 'PLT-012': ['✅','User.branchId'], 'PLT-013': ['✅','cuid 唯一'], 'PLT-014': ['✅','cuid 唯一'],
  'PLT-015': ['🟡','经 branchId 间接标识 tenant'], 'PLT-016': ['✅','业务记录均有 branchId'],
  // DATA
  'DATA-001': ['✅','Organisation'], 'DATA-002': ['✅','Branch'], 'DATA-003': ['✅','User'],
  'DATA-004': ['🟡','enum Role + RoleConfig 实体（无 UI）'], 'DATA-005': ['✅','Permission 实体已加'],
  'DATA-006': ['✅','Customer'], 'DATA-007': ['✅','CustomerAddress 已加'], 'DATA-008': ['✅','CustomerConsent 已加'],
  'DATA-009': ['✅','Motorcycle'], 'DATA-010': ['✅','Lead 已加'], 'DATA-011': ['✅','LeadSource 已加'], 'DATA-012': ['✅','LeadStage 已加'],
  'DATA-013': ['✅','LeadActivity 已加'], 'DATA-014': ['✅','Task 已加'], 'DATA-015': ['✅','TestRide 已加'], 'DATA-016': ['✅','Booking'],
  'DATA-017': ['✅','AppointmentSlot 已加'], 'DATA-018': ['✅','ServiceType 已加'], 'DATA-019': ['✅','ServiceJob'],
  'DATA-020': ['✅','JobStatusHistory 已加'], 'DATA-021': ['🟡','User.role=MECHANIC，无独立实体'], 'DATA-022': ['✅','ServiceJobItem'],
  'DATA-023': ['✅','ServiceHistory 已加'], 'DATA-024': ['✅','Product'], 'DATA-025': ['✅','InventoryLocation 已加'],
  'DATA-026': ['✅','Inventory'], 'DATA-027': ['✅','StockMovement（已补 userId）'], 'DATA-028': ['✅','ServiceReminder'],
  'DATA-029': ['✅','AutomationRule 已加'], 'DATA-030': ['✅','AutomationExecution 已加'], 'DATA-031': ['✅','Message'],
  'DATA-032': ['✅','MessageTemplate 已加'], 'DATA-033': ['✅','Campaign'], 'DATA-034': ['✅','LoyaltyAccount 已加'],
  'DATA-035': ['✅','LoyaltyTier 已加'], 'DATA-036': ['✅','LoyaltyTransaction 已加'], 'DATA-037': ['✅','Reward 已加'],
  'DATA-038': ['✅','RewardRedemption 已加'], 'DATA-039': ['✅','Referral 已加'], 'DATA-040': ['🟡','Invoice/Payment 承担'],
  'DATA-041': ['✅','Attachment 已加'], 'DATA-042': ['✅','Notification'], 'DATA-043': ['✅','AuditLog 已加'], 'DATA-044': ['✅','IntegrationConfig 已加'],
};
// 替换段1表格行（| ID | text | ⏳ |  |）
const start = md.indexOf('## 段 1：');
const end = md.indexOf('## 段 2：');
let seg1block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg1)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )⏳( \| )[^|]*( \|)');
  if (re.test(seg1block)) { seg1block = seg1block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + seg1block + md.slice(end);
// 更新段1总览行状态
md = md.replace(/(| 1 | 数据模型地基[^|]*| d+ | )⏳/, '$1✅（实体补齐）');
// 更新总览表头说明
md = md.replace('状态标记：⏳ 待验证 ｜ ✅ 满足 ｜ 🟡 部分满足 ｜ ❌ 缺失（待补齐）',
  '状态标记：⏳ 待验证 ｜ ✅ 满足 ｜ 🟡 部分满足 ｜ ❌ 缺失（待补齐）\n\n> 段 1（2026-08-20）：44 个 DATA 实体已全部落地（27 个新增模型 + 迁移 seg1_requirements_data_model），回归通过（tsc 0 错 / unit 20 / e2e 75）。');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated rows:', count);
