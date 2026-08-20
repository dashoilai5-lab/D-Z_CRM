
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg7 = {
'WS-001':['✅','dashboard jobsToday'],'WS-002':['✅','in progress 计数'],'WS-003':['✅','completed'],'WS-004':['✅','pending(WAITING)'],
'WS-005':['✅','WAITING_PARTS 状态新增'],'WS-006':['✅','mechanic board workload'],'WS-007':['✅','progress 统计'],'WS-008':['✅','READY 列表'],
'WS-009':['🟡','overdue 工单标识未做'],'WS-010':['🟡','dashboard 分支过滤未做（段11）'],
'JOB-001':['✅','jobNumber'],'JOB-002':['✅','customer'],'JOB-003':['✅','motorcycle'],'JOB-004':['✅','branch'],'JOB-005':['✅','booking'],
'JOB-006':['🟡','createdAt 近似 check-in'],'JOB-007':['✅','mileage'],'JOB-008':['✅','customerRequest'],'JOB-009':['✅','服务项目'],
'JOB-010':['✅','checklist 诊断'],'JOB-011':['✅','findings/notes'],'JOB-012':['✅','parts'],'JOB-013':['✅','labour items'],
'JOB-014':['🟡','checklist photoUrl 部分'],'JOB-015':['🟡','Attachment 多态可接'],'JOB-016':['🟡','无预计完成字段（实际有）'],'JOB-017':['✅','completedAt'],
'JOB-018':['✅','mechanicId'],'JOB-019':['🟡','单技师'],'JOB-020':['🟡','无 service advisor 字段'],'JOB-021':['✅','状态历史区块'],
'JOB-022':['✅','timestamped'],'JOB-023':['🟡','userId 未填（demo）'],'JOB-024':['🟡','WAITING_PARTS 备注待补'],'JOB-025':['✅','ready 通知'],
'JOB-026':['✅','完成→ServiceHistory'],'JOB-027':['✅','摩托快照更新'],'JOB-028':['✅','客户时间线'],'JOB-029':['✅','下次提醒计算'],
'TECH-001':['✅','User 档案'],'TECH-002':['🟡','branchId 有，多分支归属待强化'],'TECH-003':['✅','active'],'TECH-004':['✅','分配'],
'TECH-005':['✅','mechanic board'],'TECH-006':['✅','workload'],'TECH-007':['✅','active jobs'],'TECH-008':['✅','completed（staff/kpi）'],
'TECH-009':['✅','EditJobForm 重分配'],'TECH-010':['✅','技师更新状态'],'TECH-011':['✅','诊断 checklist'],'TECH-012':['✅','备注'],
'TECH-013':['✅','记录零件'],'TECH-014':['✅','完成'],'TECH-015':['✅','JobStatusHistory 审计'],
'HIST-001':['✅','完成→ServiceHistory'],'HIST-002':['✅','serviceDate'],'HIST-003':['✅','motorcycleId'],'HIST-004':['✅','customerId'],
'HIST-005':['✅','mileage'],'HIST-006':['✅','branchId'],'HIST-007':['🟡','advisorId 空'],'HIST-008':['✅','technicianId'],
'HIST-009':['✅','serviceItems JSON'],'HIST-010':['✅','partsUsed JSON'],'HIST-011':['✅','labour JSON'],'HIST-012':['✅','totalSen'],
'HIST-013':['✅','nextServiceMileage'],'HIST-014':['✅','nextServiceDate'],'HIST-015':['✅','searchable（可查）'],'HIST-016':['✅','客户可见（timeline/history）'],
'HIST-017':['✅','车辆可见（motorcycle 详情）'],'HIST-018':['✅','不可变记录'],
};
const start = md.indexOf('## 段 7：');
const end = md.indexOf('## 段 8：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg7)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 7 | 工单运营/技师管理/服务历史[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
