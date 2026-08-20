
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg15 = {};
const ux = { 1:['✅','响应式布局'],2:['✅','手机可用（e2e 矩阵）'],3:['✅','平板'],4:['✅','桌面'],5:['✅','leads 移动可用'],6:['✅','tasks 移动完成'],7:['✅','bookings 移动'],8:['✅','工单平板操作'],9:['✅','库存搜索'],10:['✅','卡片自适应'],11:['✅','表格 overflow-x'],12:['✅','主操作可见'],13:['✅','toast/校验'],14:['🟡','部分破坏操作无确认'] };
const perf = { 1:['🟡','生产评估'],2:['🟡','聚合查询优化'],3:['🟡','大库搜索'],4:['✅','列表 take 分页'],5:['🟡','大导出阻塞'],6:['🟡','后台任务'],7:['✅','异步 mock 发送'],8:['🟡','自动化同步执行'],9:['🟡','聚合缓存'],10:['🟡','phone 等索引待补（plate/sku unique）'] };
const rel = { 1:['🟡','备份未自动化（SQLite 可复制）'],2:['🟡','恢复测试未做'],3:['🟡','集中日志生产'],4:['🟡','后台任务监控'],5:['🟡','消息重试'],6:['🟡','防重发（无唯一约束）'],7:['🟡','幂等'],8:['✅','AI 故障不影响'],9:['✅','provider 故障不破坏数据'],10:['🟡','诊断信息'] };
const adm = { 1:['✅','组织资料（settings）'],2:['✅','分支管理'],3:['✅','用户（staff）'],4:['✅','角色（enum+RoleConfig）'],5:['🟡','权限 UI'],6:['✅','线索阶段（字典）'],7:['✅','线索来源'],8:['✅','丢失原因（settings）'],9:['✅','服务类型（settings）'],10:['✅','槽位'],11:['🟡','营业时间配置'],12:['✅','假日'],13:['✅','容量'],14:['🟡','提醒模板（templates 通用）'],15:['✅','消息模板'],16:['✅','自动化'],17:['✅','忠诚等级'],18:['🟡','忠诚规则'],19:['✅','奖励'],20:['🟡','推荐规则'],21:['✅','库存最低'],22:['✅','集成'],23:['🟡','网站品牌（org 字段）'],24:['✅','货币'],25:['✅','时区'],26:['🟡','通知偏好'] };
for (let i = 1; i <= 14; i++) seg15['UX-' + String(i).padStart(3, '0')] = ux[i];
for (let i = 1; i <= 10; i++) seg15['PERF-' + String(i).padStart(3, '0')] = perf[i];
for (let i = 1; i <= 10; i++) seg15['REL-' + String(i).padStart(3, '0')] = rel[i];
for (let i = 1; i <= 26; i++) seg15['ADMIN-' + String(i).padStart(3, '0')] = adm[i];
const start = md.indexOf('## 段 15：');
const end = md.indexOf('## 段 16：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg15)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 15 | 移动UX/性能/可靠性/管理配置/导航[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
// 追加导航清单核对（§47）
md += '\n## §47 导航清单核对\n\n| 模块 | 状态 | 入口 |\n|---|---|---|\n' +
  '| Dashboard | ✅ | /workshop/dashboard |\n| Leads | ✅ | /workshop/leads |\n| Customers | ✅ | /workshop/customers |\n| Motorcycles | ✅ | /workshop/motorcycles |\n| Sales Pipeline | ✅ | /workshop/pipeline |\n| Test Rides | ✅ | /workshop/test-rides |\n| Service Bookings | ✅ | /workshop/bookings |\n| Workshop | ✅ | /workshop/jobs |\n| Job Cards | ✅ | /workshop/jobs |\n| Technicians | ✅ | /workshop/mechanic + /workshop/staff |\n| Parts / Inventory | ✅ | /workshop/inventory/* |\n| Tasks | ✅ | /workshop/tasks |\n| Reminders | ✅ | /workshop/crm/reminders |\n| Automations | ✅ | /workshop/automations |\n| Campaigns | ✅ | /workshop/marketing/calendar |\n| Loyalty | ✅ | /workshop/loyalty |\n| Referrals | ✅ | /workshop/loyalty (tab) |\n| Analytics | ✅ | /workshop/analytics |\n| Reports | 🟡 | analytics 覆盖 |\n| Branches | 🟡 | analytics Branches tab |\n| Users | ✅ | /workshop/staff |\n| Integrations | ✅ | /workshop/integrations |\n| Settings | ✅ | /workshop/settings |\n';
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
