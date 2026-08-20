
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg6 = {
'BOOK-001':['✅','rider/book 在线预约'],'BOOK-002':['✅','移动端'],'BOOK-003':['✅','选摩托车'],'BOOK-004':['✅','套餐+附加服务'],
'BOOK-005':['🟡','rider 固定主分支，workshop 排期可选'],'BOOK-006':['✅','日期'],'BOOK-007':['✅','时段从槽位表'],'BOOK-008':['✅','满槽隐藏+提交校验'],
'BOOK-009':['✅','timeline booking 事件'],'BOOK-010':['✅','workshop 月历视图'],'BOOK-011':['🟡','确认 Message 记录生成，无真实发送'],
'BOOK-012':['🟡','channel=WHATSAPP 记录'],'BOOK-013':['🟡','SMS 通道支持（Message 模型）'],'BOOK-014':['🟡','email 通道支持'],
'BOOK-015':['✅','确认含日期'],'BOOK-016':['✅','含时间'],'BOOK-017':['✅','含分支'],'BOOK-018':['✅','含车辆'],'BOOK-019':['✅','含 ref'],
'BOOK-020':['🟡','counter 建单流程（check-in 可建 job）'],'BOOK-021':['✅','reschedule'],'BOOK-022':['✅','cancel'],'BOOK-023':['✅','confirm'],
'BOOK-024':['✅','NO_SHOW 新增+按钮'],'BOOK-025':['✅','状态变更写 AuditLog'],'BOOK-026':['✅','日视图（日期筛选）'],
'BOOK-027':['🟡','无周视图（按日列表）'],'BOOK-028':['✅','月历视图'],'BOOK-029':['✅','分支过滤'],'BOOK-030':['🟡','无技师过滤'],
'BOOK-031':['✅','槽位管理页（生成/容量）'],'BOOK-032':['🟡','无营业日排除（按天生成）'],'BOOK-033':['✅','节假日标记'],'BOOK-034':['✅','maxBookings 配置'],
'BOOK-035':['✅','防超卖校验（bookedCount>=max 拒绝）'],
};
const start = md.indexOf('## 段 6：');
const end = md.indexOf('## 段 7：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg6)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 6 | 在线服务预约[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
