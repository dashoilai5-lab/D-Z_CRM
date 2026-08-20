
const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma','utf8');
const models = [...schema.matchAll(/^model (\w+)/gm)].map(m => m[1]);
const enums = [...schema.matchAll(/^enum (\w+)/gm)].map(m => m[1]);
// DATA 实体映射：id -> {model, status, note}
const dataMap = {
  'DATA-001': ['Organisation','✅','Organisation 模型'], 'DATA-002': ['Branch','✅','Branch 模型'],
  'DATA-003': ['User','✅','User 模型'], 'DATA-004': ['Role','🟡','仅有 enum Role（9 值），非实体，无自定义角色'],
  'DATA-005': ['Permission','❌','无'], 'DATA-006': ['Customer','✅','Customer 模型'],
  'DATA-007': ['CustomerAddress','❌','仅 Customer.address 单字符串字段'], 'DATA-008': ['CustomerConsent','❌','无 consent 模型/字段'],
  'DATA-009': ['Motorcycle','✅','Motorcycle 模型'], 'DATA-010': ['Lead','❌','无 Lead 模型'], 
  'DATA-011': ['LeadSource','❌','无（Customer.source 字符串近似）'], 'DATA-012': ['LeadStage','❌','无'],
  'DATA-013': ['LeadActivity','❌','无'], 'DATA-014': ['Task','❌','无 Task 模型'],
  'DATA-015': ['TestRide','❌','无'], 'DATA-016': ['Booking','✅','Booking 模型'],
  'DATA-017': ['AppointmentSlot','❌','无（timeSlot 字符串）'], 'DATA-018': ['ServiceType','🟡','ServicePackage/Item 近似，无独立 ServiceType'],
  'DATA-019': ['ServiceJob','✅','ServiceJob 模型'], 'DATA-020': ['JobStatusHistory','❌','无状态历史表'],
  'DATA-021': ['Technician','🟡','User.role=MECHANIC，无独立实体'], 'DATA-022': ['ServiceJobItem','✅','ServiceJobItem 模型'],
  'DATA-023': ['ServiceHistory','❌','ServiceJob 承担，无独立历史实体'], 'DATA-024': ['Product','✅','Product 模型（parts catalogue）'],
  'DATA-025': ['InventoryLocation','❌','无（Inventory 仅按 branch）'], 'DATA-026': ['Inventory','✅','Inventory 模型'],
  'DATA-027': ['StockMovement','✅','StockMovement 模型（缺 userId）'], 'DATA-028': ['ServiceReminder','✅','ServiceReminder 模型'],
  'DATA-029': ['AutomationRule','❌','无'], 'DATA-030': ['AutomationExecution','❌','无'],
  'DATA-031': ['Message','✅','Message 模型'], 'DATA-032': ['MessageTemplate','❌','无'],
  'DATA-033': ['Campaign','✅','Campaign 模型'], 'DATA-034': ['LoyaltyAccount','❌','无'],
  'DATA-035': ['LoyaltyTier','❌','无'], 'DATA-036': ['LoyaltyTransaction','❌','无'],
  'DATA-037': ['Reward','❌','无'], 'DATA-038': ['RewardRedemption','❌','无'],
  'DATA-039': ['Referral','❌','无'], 'DATA-040': ['RevenueRecord','🟡','Invoice/Payment 承担，无独立 revenue 记录'],
  'DATA-041': ['Attachment','❌','无'], 'DATA-042': ['Notification','✅','Notification 模型'],
  'DATA-043': ['AuditLog','❌','无'], 'DATA-044': ['IntegrationConfig','❌','无'],
};
let out = '# 段1 核对：DATA + PLT\n\n## DATA-001~044（核心实体）\n\n| ID | 实体 | 状态 | 说明 |\n|---|---|---|---|\n';
let ok=0, part=0, miss=0;
for (let i=1;i<=44;i++){
  const id='DATA-'+String(i).padStart(3,'0');
  const [e,s,n]=dataMap[id];
  if(s==='✅')ok++; else if(s==='🟡')part++; else miss++;
  out += '| '+id+' | '+e+' | '+s+' | '+n+' |\n';
}
out += '\n### 小结：✅ '+ok+' ｜ 🟡 '+part+' ｜ ❌ '+miss+'\n\n';
fs.writeFileSync('/tmp/seg1-data.md', out);
console.log('DATA:', ok, 'ok,', part, 'partial,', miss, 'missing');
console.log('models:', models.length, models.join(', '));
console.log('enums:', enums.length);
