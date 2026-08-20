
const fs = require('fs');
const reqs = fs.readFileSync('/tmp/reqs.txt','utf8').trim().split('\n').map(l => { const i = l.indexOf('|'); return { id: l.slice(0,i), text: l.slice(i+1).trim() }; });
const segments = [
  { n: 1,  name: '数据模型地基（租户/多分支/核心实体）', prefixes: ['PLT','DATA'], sections: '§2 + §30' },
  { n: 2,  name: '认证与权限（登录/角色/RBAC）', prefixes: ['AUTH','ROLE','RBAC'], sections: '§3' },
  { n: 3,  name: '网站与线索捕获', prefixes: ['WEB','LEAD'], sections: '§5 + §6' },
  { n: 4,  name: '销售管道/跟进任务/试驾', prefixes: ['PIPE','TASK','TEST'], sections: '§7-9' },
  { n: 5,  name: '客户 CRM/车辆登记/时间线', prefixes: ['CRM','VEH','TIME'], sections: '§10-11 + §29' },
  { n: 6,  name: '在线服务预约', prefixes: ['BOOK'], sections: '§12' },
  { n: 7,  name: '工单运营/技师管理/服务历史', prefixes: ['WS','JOB','TECH','HIST'], sections: '§13-15' },
  { n: 8,  name: '零件与库存', prefixes: ['PART','INV'], sections: '§16' },
  { n: 9,  name: '提醒/自动化/消息', prefixes: ['REM','AUTO','MSG'], sections: '§17-19' },
  { n: 10, name: '忠诚度/推荐/营销活动', prefixes: ['LOY','REF','MKT'], sections: '§20-22' },
  { n: 11, name: '仪表盘/营收/分析/多分支', prefixes: ['DASH','REV','ANA','BR'], sections: '§4 + §23-25' },
  { n: 12, name: '搜索/通知/导入导出/文件', prefixes: ['SEARCH','NOTIF','IMPORT','EXPORT','FILE'], sections: '§26 + §28 + §31-32 + §37' },
  { n: 13, name: 'AI-Native CRM', prefixes: ['AI'], sections: '§27' },
  { n: 14, name: 'API/集成/审计/安全/隐私', prefixes: ['API','INT','AUDIT','SEC','PRIV'], sections: '§33-36' },
  { n: 15, name: '移动UX/性能/可靠性/管理配置/导航', prefixes: ['UX','PERF','REL','ADMIN'], sections: '§38-41 + §47' },
  { n: 16, name: '端到端工作流 + V1 完成定义', prefixes: ['E2E','DONE'], sections: '§42-46' },
];
const bySeg = segments.map(s => ({ ...s, reqs: reqs.filter(r => s.prefixes.some(p => r.id.startsWith(p+'-'))) }));
let md = '# D&Z AI CRM — 需求验证追踪（REQUIREMENTS VERIFICATION）\n\n';
md += '> 来源：docs/D&Z AI CRM — Detailed Product Requirements Checklist.md（895 条编号需求，49 章）\n';
md += '> 生成：session-3685dd91 · 目标 goal-c85d7630\n\n';
md += '状态标记：⏳ 待验证 ｜ ✅ 满足 ｜ 🟡 部分满足 ｜ ❌ 缺失（待补齐）\n\n';
md += '## 分段总览\n\n| 段 | 范围 | 章节 | 需求数 | 状态 |\n|---|---|---|---|---|\n';
bySeg.forEach(s => md += '| '+s.n+' | '+s.name+' | '+s.sections+' | '+s.reqs.length+' | ⏳ |\n');
md += '\n---\n\n';
bySeg.forEach(s => {
  md += '## 段 '+s.n+'：'+s.name+'（'+s.sections+'）— '+s.reqs.length+' 条\n\n';
  md += '<details><summary>需求清单</summary>\n\n| ID | 需求 | 状态 | 证据/备注 |\n|---|---|---|---|\n';
  s.reqs.forEach(r => md += '| '+r.id+' | '+r.text.replace(/\|/g,'\\|')+' | ⏳ |  |\n');
  md += '\n</details>\n\n';
});
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('OK segments:'); bySeg.forEach(s => console.log(s.n, s.reqs.length));
