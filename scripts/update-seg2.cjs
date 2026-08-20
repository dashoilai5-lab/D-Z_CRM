
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg2 = {
  'AUTH-001': ['❌','无认证，demo persona cookie'], 'AUTH-002': ['❌','无 email/password 登录'],
  'AUTH-003': ['❌','无密码存储（CustomerAuthProfile.pin 明文）'], 'AUTH-004': ['❌','无密码重置'],
  'AUTH-005': ['❌','无邮箱验证'], 'AUTH-006': ['❌','无会话过期'],
  'AUTH-007': ['❌','无登出'], 'AUTH-008': ['🟡','User.active 字段有，无禁用 UI/强制'],
  'AUTH-009': ['❌','无登录入口'], 'AUTH-010': ['❌','无 MFA'],
  'AUTH-011': ['❌','AuditLog 实体已建未接入'], 'AUTH-012': ['❌','无'], 'AUTH-013': ['❌','无'],
  'ROLE-001': ['✅','SUPER_ADMIN'], 'ROLE-002': ['✅','OWNER'], 'ROLE-003': ['❌','无 HEAD_OFFICE_ADMIN'],
  'ROLE-004': ['✅','MANAGER'], 'ROLE-005': ['❌','无 SALES_MANAGER'], 'ROLE-006': ['❌','无 SALES_ADVISOR'],
  'ROLE-007': ['❌','无 SERVICE_MANAGER'], 'ROLE-008': ['✅','SERVICE_ADVISOR'], 'ROLE-009': ['✅','MECHANIC'],
  'ROLE-010': ['❌','无 PARTS_MANAGER'], 'ROLE-011': ['✅','INVENTORY'], 'ROLE-012': ['✅','MARKETING'],
  'ROLE-013': ['❌','无 CUSTOMER_SERVICE'], 'ROLE-014': ['✅','ACCOUNTING'], 'ROLE-015': ['❌','无 AUDITOR'],
  'RBAC-001': ['🟡','nav-registry persona 级（3 角色）'], 'RBAC-002': ['❌','RoleConfig 已建无 UI'],
  'RBAC-003': ['❌','Permission 已建未用'], 'RBAC-004': ['❌','无 view 权限矩阵'],
  'RBAC-005': ['❌','无 create'], 'RBAC-006': ['❌','无 edit'], 'RBAC-007': ['❌','无 delete'],
  'RBAC-008': ['❌','无 export'], 'RBAC-009': ['❌','无财务可见性限制'],
  'RBAC-010': ['❌','User.branchId 有，无查询强制'], 'RBAC-011': ['❌','无总部视图'],
  'RBAC-012': ['❌','无分支限定'], 'RBAC-013': ['🟡','mechanic 页面按 mechanicId 过滤（HANDOFF）'],
  'RBAC-014': ['❌','AuditLog 未接入'],
};
const start = md.indexOf('## 段 2：');
const end = md.indexOf('## 段 3：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg2)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )⏳( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 2 | 认证与权限[^|]*| d+ | )⏳/, '$1⏳ 核对完（9✅/3🟡/30❌，待补齐）');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
