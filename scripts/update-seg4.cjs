
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg4 = {
  'PIPE-001': ['✅','Kanban 管道 /workshop/pipeline'], 'PIPE-002': ['✅','卡片 stage 下拉移动'], 'PIPE-003': ['✅','LeadActivity 时间戳'], 'PIPE-004': ['✅','活动记录 userId'],
  'PIPE-005': ['✅','每列计数'], 'PIPE-006': ['✅','每列金额'], 'PIPE-007': ['✅','salesperson 筛选'], 'PIPE-008': ['🟡','branch 筛选待数据（filter 支持）'],
  'PIPE-009': ['🟡','车型筛选：列表页 q 搜索覆盖'], 'PIPE-010': ['✅','source 筛选'], 'PIPE-011': ['🟡','日期筛选未做（按 updatedAt 排序）'],
  'PIPE-012': ['✅','Close Lost 原因'], 'PIPE-013': ['🟡','丢失原因自由文本，可配置列表待 ADMIN 段'], 'PIPE-014': ['✅','转化率统计'], 'PIPE-015': ['✅','平均阶段耗时'],
  'PIPE-016': ['✅','stale leads 标识'], 'PIPE-017': ['✅','详情页重分配'], 'PIPE-018': ['✅','owner 筛选（我的线索）'], 'PIPE-019': ['✅','activities 保留'],
  'PIPE-020': ['✅','Closed Won → 客户转换'],
  'TASK-001': ['✅','对 lead 建任务'], 'TASK-002': ['🟡','relatedType 支持 CUSTOMER，UI 选择仅 LEAD'], 'TASK-003': ['🟡','BOOKING 类型支持，UI 未列'], 'TASK-004': ['🟡','VEHICLE 类型支持，UI 未列'],
  'TASK-005': ['✅','owner'], 'TASK-006': ['✅','due date'], 'TASK-007': ['✅','datetime 含时间'], 'TASK-008': ['✅','status'], 'TASK-009': ['✅','Open'],
  'TASK-010': ['✅','Completed'], 'TASK-011': ['✅','Overdue 计算'], 'TASK-012': ['✅','priority'], 'TASK-013': ['✅','notes/description'],
  'TASK-014': ['✅','创建通知 owner'], 'TASK-015': ['✅','经理查看 overdue 筛选'], 'TASK-016': ['✅','试驾完成自动建任务'], 'TASK-017': ['✅','completedAt+completedBy'],
  'TEST-001': ['✅','workshop 排期表单'], 'TEST-002': ['✅','公开 /test-ride 表单'], 'TEST-003': ['✅','lead/customer 引用'], 'TEST-004': ['✅','motorcycleModel'],
  'TEST-005': ['✅','branch'], 'TEST-006': ['✅','date'], 'TEST-007': ['✅','time'], 'TEST-008': ['✅','salesperson'],
  'TEST-009': ['✅','Pending'], 'TEST-010': ['✅','Confirmed'], 'TEST-011': ['✅','Completed（实测）'], 'TEST-012': ['✅','Cancelled'], 'TEST-013': ['✅','No Show'],
  'TEST-014': ['✅','完成更新时间线（实测）'], 'TEST-015': ['✅','完成触发跟进任务（实测）'],
};
const start = md.indexOf('## 段 4：');
const end = md.indexOf('## 段 5：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg4)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 4 | 销售管道/跟进任务/试驾[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
