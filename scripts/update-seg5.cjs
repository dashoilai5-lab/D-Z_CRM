
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg5 = {};
// CRM
const crmNotes = { 'CRM-001':['✅','id'],'CRM-002':['✅','name'],'CRM-003':['✅','phone'],'CRM-004':['✅','email'],'CRM-005':['✅','address 字段'],
'CRM-006':['✅','branchId'],'CRM-007':['✅','joinedAt'],'CRM-008':['✅','visits 统计'],'CRM-009':['✅','lifetime spend'],'CRM-010':['✅','车辆卡'],
'CRM-011':['✅','timeline 转化事件'],'CRM-012':['✅','spending tab'],'CRM-013':['✅','history tab'],'CRM-014':['✅','timeline booking 事件'],
'CRM-015':['✅','messages tab'],'CRM-016':['✅','reminders'],'CRM-017':['🟡','timeline 有 task 事件，无独立 tab'],'CRM-018':['✅','notes tab'],
'CRM-019':['✅','loyalty 徽章'],'CRM-020':['✅','points'],'CRM-021':['✅','referrals 徽章+timeline'],'CRM-022':['🟡','notes 只读，编辑 UI 待补'],
'CRM-023':['🟡','无作者字段'],'CRM-024':['🟡','无笔记时间'],'CRM-025':['✅','tags 字段+展示'],'CRM-026':['🟡','Attachment 实体+查询，无上传 UI'],
'CRM-027':['✅','consent 状态'],'CRM-028':['✅','preference'] };
// VEH
const vehNotes = { 'VEH-001':['✅','一客多车'],'VEH-002':['✅','customerId'],'VEH-003':['✅','id'],'VEH-004':['✅','brand'],'VEH-005':['✅','model'],
'VEH-006':['🟡','无独立 variant 字段（model 字符串）'],'VEH-007':['✅','plate unique'],'VEH-008':['✅','vin'],'VEH-009':['✅','engineNo 已补'],
'VEH-010':['✅','year'],'VEH-011':['✅','purchaseDate'],'VEH-012':['✅','currentMileage'],'VEH-013':['✅','warrantyExpiry/Km'],
'VEH-014':['✅','notes'],'VEH-015':['✅','服务历史表'],'VEH-016':['✅','jobs 里程记录'],'VEH-017':['✅','nextServiceMileage'],
'VEH-018':['✅','nextServiceEstDate'],'VEH-019':['✅','转移+审计'],'VEH-020':['✅','历史保留（jobs 引用不变）'] };
// TIME
const timeNotes = { 'TIME-001':['✅','lead created'],'TIME-002':['✅','lead assigned'],'TIME-003':['✅','stage changed'],'TIME-004':['✅','note added'],
'TIME-005':['✅','follow-up created'],'TIME-006':['✅','follow-up completed'],'TIME-007':['✅','test ride scheduled'],'TIME-008':['✅','test ride completed'],
'TIME-009':['✅','booking created'],'TIME-010':['🟡','rescheduled 事件未单独记'],'TIME-011':['🟡','cancelled 事件未单独记'],'TIME-012':['✅','vehicle checked in'],
'TIME-013':['✅','service started'],'TIME-014':['✅','service completed'],'TIME-015':['✅','motorcycle delivered'],'TIME-016':['✅','reminder scheduled'],
'TIME-017':['🟡','reminder sent 事件未接'],'TIME-018':['✅','message sent'],'TIME-019':['🟡','customer response 未集成'],'TIME-020':['✅','loyalty earned'],
'TIME-021':['✅','loyalty redeemed'],'TIME-022':['✅','referral'],'TIME-023':['✅','transaction'],'TIME-024':['✅','timestamp'],
'TIME-025':['🟡','user 标识部分'],'TIME-026':['✅','chronological sort'] };
Object.assign(seg5, crmNotes, vehNotes, timeNotes);
const start = md.indexOf('## 段 5：');
const end = md.indexOf('## 段 6：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg5)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 5 | 客户 CRM/车辆登记/时间线[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
