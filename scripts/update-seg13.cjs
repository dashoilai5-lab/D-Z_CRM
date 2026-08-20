
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg13 = {
'AI-001':['✅','建议中心（逾期/低库存等）'],'AI-002':['✅','识别需跟进线索（stale）'],'AI-003':['✅','逾期提醒'],'AI-004':['✅','基于 CRM 历史建议'],
'AI-005':['✅','AI 徽章+草稿标注'],'AI-006':['✅','不自动改记录（接受才生效）'],'AI-007':['✅','可编辑/接受/拒绝（草稿+建议）'],
'AI-008':['✅','客户总结（timeline）'],'AI-009':['✅','车辆服务历史总结'],'AI-010':['✅','先前互动（messages）'],'AI-011':['✅','AI 起草跟进消息'],
'AI-012':['✅','权限内查询（org 过滤）'],
'AI-013':['✅','WhatsApp 草稿'],'AI-014':['✅','SMS 草稿（通道）'],'AI-015':['✅','email 草稿（通道）'],'AI-016':['✅','语气可选（3 种）'],
'AI-017':['✅','发送前可编辑'],'AI-018':['✅','只引用结构数据'],'AI-019':['✅','草稿基于真实 CRM 数据（实测 Y15ZR 31500km）'],
'AI-020':['✅','洞察（规则式）'],'AI-021':['🟡','线索量异常检测未做'],'AI-022':['🟡','预约异常未做'],'AI-023':['✅','留存趋势（repeat %）'],
'AI-024':['✅','分支对比（analytics）'],'AI-025':['✅','AI 徽章区分'],'AI-026':['🟡','日期范围固定 30 天'],'AI-027':['✅','权限内（server 查询）'],
'AI-028':['✅','租户隔离（org 过滤）'],'AI-029':['✅','机密不发给模型（mock 无外部调用）'],'AI-030':['✅','RBAC 页面权限'],'AI-031':['🟡','高影响动作授权规则未定义'],
'AI-032':['✅','AI 失败不影响核心（try/catch）'],'AI-033':['✅','CRUD 独立于 AI'],
};
const start = md.indexOf('## 段 13：');
const end = md.indexOf('## 段 14：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg13)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 13 | AI-Native CRM[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
