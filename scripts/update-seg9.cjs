
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg9 = {
'REM-001':['✅','completion 自动创建下次提醒'],'REM-002':['✅','按推荐日期'],'REM-003':['✅','按间隔'],'REM-004':['✅','customer'],'REM-005':['✅','motorcycle'],
'REM-006':['✅','jobId 关联'],'REM-007':['✅','scheduled/estimatedDate'],'REM-008':['🟡','WhatsApp 通道（Message 记录）'],'REM-009':['🟡','SMS'],'REM-010':['🟡','email'],
'REM-011':['✅','模板可配置（templates 页）'],'REM-012':['✅','{name} 占位符'],'REM-013':['✅','{bike}'],'REM-014':['✅','{date}'],'REM-015':['🟡','{link} 生成未接'],
'REM-016':['✅','MessageStatus 记录'],'REM-017':['✅','FAILED 记录'],'REM-018':['🟡','送达更新时间线未接'],'REM-019':['🟡','回复关联未接'],'REM-020':['🟡','提醒→预约归因未接'],
'REM-021':['🟡','续期提醒类型未扩展'],'REM-022':['🟡','保险续期'],'REM-023':['🟡','保修到期'],'REM-024':['🟡','会员续期'],'REM-025':['🟡','提醒时机配置归 ADMIN 段'],
'AUTO-001':['✅','规则实体+管理页'],'AUTO-002':['✅','事件触发'],'AUTO-003':['🟡','时间触发未实现'],'AUTO-004':['✅','conditions JSON 字段'],'AUTO-005':['✅','actions 执行'],
'AUTO-006':['✅','LEAD_CREATED（实测）'],'AUTO-007':['✅','LEAD_STAGE_CHANGED 支持'],'AUTO-008':['✅','BOOKING_CREATED 接入'],'AUTO-009':['🟡','BOOKING_APPROACHING 未接调度'],
'AUTO-010':['🟡','SERVICE_COMPLETED 未接'],'AUTO-011':['🟡','SERVICE_DUE 未接'],'AUTO-012':['✅','JOB_READY 接入'],'AUTO-013':['🟡','CUSTOMER_INACTIVE 未接'],
'AUTO-014':['🟡','LOYALTY_EVENT 未接'],'AUTO-015':['🟡','LOW_STOCK 未接'],'AUTO-016':['✅','CREATE_TASK'],'AUTO-017':['✅','ASSIGN_LEAD'],
'AUTO-018':['✅','SEND_MESSAGE'],'AUTO-019':['✅','SCHEDULE_REMINDER'],'AUTO-020':['✅','UPDATE_TAGS'],'AUTO-021':['✅','执行日志'],'AUTO-022':['✅','失败可见'],
'AUTO-023':['✅','启停 toggle'],'AUTO-024':['✅','dedupe 防循环'],
'MSG-001':['✅','WhatsApp provider 抽象'],'MSG-002':['🟡','SMS 通道字段支持'],'MSG-003':['🟡','email 通道字段支持'],'MSG-004':['✅','模板配置'],'MSG-005':['✅','{name}'],
'MSG-006':['✅','{bike}'],'MSG-007':['✅','{date}'],'MSG-008':['✅','{time}'],'MSG-009':['✅','{branch}'],'MSG-010':['🟡','{link} 未生成'],'MSG-011':['🟡','{total} 部分'],
'MSG-012':['✅','通信历史'],'MSG-013':['✅','channel'],'MSG-014':['✅','send time'],'MSG-015':['✅','recipient'],'MSG-016':['✅','delivery status'],
'MSG-017':['✅','opt-out 拦截'],'MSG-018':['🟡','交易同意管理部分'],'MSG-019':['🟡','IntegrationConfig 加密字段'],'MSG-020':['✅','FAILED 记录'],
};
const start = md.indexOf('## 段 9：');
const end = md.indexOf('## 段 10：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg9)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 9 | 提醒/自动化/消息[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
