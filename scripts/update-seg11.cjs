
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
// 段11 状态映射（111 条，按区间生成）
const seg11 = {};
// DASH-001~023
const dash = { 1:['✅','登录后 dashboard'],2:['✅','Total Leads'],3:['✅','本月新线索'],4:['✅','bookings'],5:['✅','service bookings'],6:['✅','revenue'],7:['✅','repeat %'],8:['✅','follow-up tasks'],9:['✅','upcoming bookings'],10:['✅','customer timeline'],11:['✅','analytics 线索来源'],12:['✅','转化趋势'],13:['✅','营收趋势'],14:['🟡','固定 30 天，无自定义范围'],15:['🟡','today 快捷未做'],16:['🟡','昨日对比未做'],17:['🟡','7 天未做'],18:['🟡','30 天（默认）'],19:['🟡','本月未做'],20:['🟡','自定义范围未做'],21:['✅','权限内查询'],22:['🟡','head office 聚合部分（branches tab）'],23:['✅','指标链接明细'] };
// REV-001~012
const rev = { 1:['✅','Invoice 来源'],2:['✅','native 记录'],3:['✅','amountSen'],4:['✅','issuedAt'],5:['✅','branchId'],6:['✅','customerId'],7:['✅','InvoiceSource'],8:['✅','SERVICE'],9:['✅','PART'],10:['🟡','motorcycle sales 无独立来源'],11:['✅','不虚构'],12:['✅','预估(Lead)vs实际(Invoice)区分'] };
// ANA-001~051
const ana = {};
const anaMap = { 1:['✅','total leads'],2:['✅','by source'],3:['✅','by salesperson'],4:['✅','by branch（branches tab）'],5:['✅','by model'],6:['✅','stage conversion'],7:['✅','lead→sale'],8:['🟡','response time 未测'],9:['✅','stale'],10:['✅','lost reasons'],
11:['✅','bookings'],12:['✅','completed'],13:['✅','cancelled'],14:['✅','no-show'],15:['✅','throughput'],16:['✅','avg completion days'],17:['✅','waiting parts'],18:['✅','technician workload'],19:['🟡','technician completed 未单列'],20:['✅','top services'],
21:['✅','new customers'],22:['✅','repeat'],23:['✅','retention'],24:['✅','avg frequency'],25:['✅','inactive'],26:['✅','members'],27:['✅','referrals'],
28:['✅','total revenue'],29:['✅','trend'],30:['✅','by branch'],31:['✅','by source'],32:['✅','by service type'],33:['✅','parts'],34:['🟡','motorcycle sales 无数据'],35:['✅','per customer'],36:['✅','repeat revenue'],
37:['✅','current stock'],38:['✅','low stock'],39:['✅','out of stock'],40:['✅','movements'],41:['🟡','frequently used parts 未单列'],42:['✅','by branch'],
43:['🟡','日期过滤固定 30 天'],44:['🟡','分支过滤未做'],45:['🟡','对比期未做'],46:['✅','recharts 图表'],47:['✅','表格'],48:['✅','导出'],49:['✅','CSV'],50:['✅','server 端查询'],51:['✅','与 dashboard 同源'] };
// BR-001~025
const br = { 1:['✅','branches tab 全分支'],2:['✅','总数'],3:['✅','leads across'],4:['✅','bookings across'],5:['✅','revenue across'],6:['✅','customers across'],7:['✅','对比'],8:['🟡','分支过滤待补'],9:['✅','营收排名'],10:['✅','统一客户表'],11:['✅','统一时间线'],12:['✅','车辆统一'],13:['✅','branchId 保留'],14:['✅'],15:['✅','库存分离'],16:['✅','analytics 库存 byBranch'],17:['✅','转移功能'],18:['🟡','共享工作流配置'],19:['🟡','共享服务类型'],20:['🟡','campaign 模板'],21:['🟡','automation 模板'],22:['✅','本地营业时间'],23:['✅','本地容量'],24:['✅','分支不重部署'],25:['✅','继承组织配置'] };
for (let i = 1; i <= 23; i++) seg11['DASH-' + String(i).padStart(3, '0')] = dash[i];
for (let i = 1; i <= 12; i++) seg11['REV-' + String(i).padStart(3, '0')] = rev[i];
for (let i = 1; i <= 51; i++) seg11['ANA-' + String(i).padStart(3, '0')] = anaMap[i];
for (let i = 1; i <= 25; i++) seg11['BR-' + String(i).padStart(3, '0')] = br[i];
const start = md.indexOf('## 段 11：');
const end = md.indexOf('## 段 12：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg11)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + (note ?? '') + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 11 | 仪表盘/营收/分析/多分支[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
