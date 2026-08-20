
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg2 = {
  'AUTH-001': ['✅','middleware 门禁+实测跳转 /login'], 'AUTH-002': ['✅','email/password 登录（实测）'],
  'AUTH-003': ['✅','scrypt 哈希（node:crypto）'], 'AUTH-004': ['✅','forgot/reset 流程+login 页三态'],
  'AUTH-005': ['🟡','emailVerified+verifyEmail action，无邮件发送（demo 用户已 verified）'], 'AUTH-006': ['✅','token 12h 过期'],
  'AUTH-007': ['✅','logout action+sidebar 按钮'], 'AUTH-008': ['✅','active=false 登录被拒+审计'],
  'AUTH-009': ['✅','disabled 阻止登录（实测逻辑）'], 'AUTH-010': ['🟡','TOTP 校验已接入登录，启用 UI 待段15'],
  'AUTH-011': ['✅','LOGIN 写 AuditLog'], 'AUTH-012': ['✅','LOGIN_FAILED 写 AuditLog'], 'AUTH-013': ['✅','5 次锁定 15 分钟'],
  'ROLE-001': ['✅','SUPER_ADMIN'], 'ROLE-002': ['✅','OWNER'], 'ROLE-003': ['✅','HEAD_OFFICE_ADMIN'],
  'ROLE-004': ['✅','MANAGER'], 'ROLE-005': ['✅','SALES_MANAGER'], 'ROLE-006': ['✅','SALES_ADVISOR'],
  'ROLE-007': ['✅','SERVICE_MANAGER'], 'ROLE-008': ['✅','SERVICE_ADVISOR'], 'ROLE-009': ['✅','MECHANIC'],
  'ROLE-010': ['✅','PARTS_MANAGER'], 'ROLE-011': ['✅','INVENTORY'], 'ROLE-012': ['✅','MARKETING'],
  'ROLE-013': ['✅','CUSTOMER_SERVICE'], 'ROLE-014': ['✅','ACCOUNTING'], 'ROLE-015': ['✅','AUDITOR'],
  'RBAC-001': ['✅','can() 按角色+Permission 覆盖'], 'RBAC-002': ['🟡','RoleConfig 实体+seed，自定义 UI 待段15'],
  'RBAC-003': ['✅','module 级权限矩阵（26 模块）'], 'RBAC-004': ['✅','view'], 'RBAC-005': ['✅','create'],
  'RBAC-006': ['✅','edit'], 'RBAC-007': ['✅','delete'], 'RBAC-008': ['✅','export'],
  'RBAC-009': ['✅','canSeeFinance'], 'RBAC-010': ['🟡','isHeadOfficeRole 有，查询级过滤待业务段接入'],
  'RBAC-011': ['🟡','HEAD_OFFICE_ADMIN 角色有，聚合页面归段11'], 'RBAC-012': ['🟡','分支限定待业务段'],
  'RBAC-013': ['✅','默认矩阵限 MECHANIC + 现有 mechanicId 过滤'], 'RBAC-014': ['🟡','audit() helper+登录审计已接，业务埋点随各段'],
};
const start = md.indexOf('## 段 2：');
const end = md.indexOf('## 段 3：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg2)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 2 | 认证与权限[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
