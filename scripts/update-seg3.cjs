
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg3 = {
  'WEB-001': ['✅','/catalogue + /contact + /test-ride 公开站点'], 'WEB-002': ['✅','移动优先布局'], 'WEB-003': ['✅','桌面正常'], 'WEB-004': ['✅','e2e 3 浏览器矩阵'],
  'WEB-005': ['✅','org.name 品牌展示'], 'WEB-006': ['✅','org.logo 条件渲染'], 'WEB-007': ['✅','contact 页电话/邮箱'], 'WEB-008': ['✅','分支列表展示'],
  'WEB-009': ['✅','营业时间 JSON 渲染'], 'WEB-010': ['✅','/contact 咨询表单'], 'WEB-011': ['✅','/rider/book 已有'], 'WEB-012': ['✅','/test-ride 表单'],
  'WEB-013': ['✅','wa.me 链接'], 'WEB-014': ['✅','提交自动建 Lead（实测）'], 'WEB-015': ['✅','自动进 CRM 无需重录'],
  'WEB-016': ['✅','/catalogue 目录页'], 'WEB-017': ['✅','品牌筛选'], 'WEB-018': ['✅','型号列表'], 'WEB-019': ['🟡','品牌+型号，无 variant 维度'],
  'WEB-020': ['✅','价格展示'], 'WEB-021': ['🟡','emoji 占位，真实图待接 posters'], 'WEB-022': ['🟡','无规格字段展示'], 'WEB-023': ['✅','In stock 徽章'],
  'WEB-024': ['✅','Enquire 链接带 model 参数'],
  'LEAD-001': ['✅','网站咨询→Lead（实测 LD-20260820-001）'], 'LEAD-002': ['🟡','WhatsApp 来源可手动录，无自动接收'], 'LEAD-003': ['✅','手动创建 Walk-in'], 'LEAD-004': ['✅','手动创建 Phone'],
  'LEAD-005': ['🟡','Social 来源可录，无导入'], 'LEAD-006': ['✅','leadNumber 唯一'], 'LEAD-007': ['✅','createdAt'], 'LEAD-008': ['✅','customerName'],
  'LEAD-009': ['✅','phone'], 'LEAD-010': ['✅','email'], 'LEAD-011': ['✅','source 字典'], 'LEAD-012': ['✅','branchId'],
  'LEAD-013': ['✅','motorcycleInterest'], 'LEAD-014': ['✅','notes'], 'LEAD-015': ['✅','estimatedValueSen'], 'LEAD-016': ['✅','assignedUserId + 通知'],
  'LEAD-017': ['✅','nextFollowUpAt'], 'LEAD-018': ['✅','datetime 完整'], 'LEAD-019': ['✅','tags'], 'LEAD-020': ['🟡','Attachment 实体有，lead 附件 UI 无'],
  'LEAD-021': ['✅','findDuplicates 按 phone/email'], 'LEAD-022': ['✅','新建页重复警告'],
};
const start = md.indexOf('## 段 3：');
const end = md.indexOf('## 段 4：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg3)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 3 | 网站与线索捕获[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
