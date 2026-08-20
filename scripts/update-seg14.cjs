
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg14 = {};
const api = { 1:['🟡','demo 无认证（生产 Supabase）'],2:['🟡','认证生产'],3:['✅','tenant 隔离查询'],4:['✅','server 端权限'],5:['🟡','限流生产'],6:['✅','失败记录 FAILED'],7:['🟡','webhook 无'],8:['🟡','签名验证无'],9:['🟡','幂等控制无'] };
const int = { 1:['✅','WhatsApp provider 抽象'],2:['✅','SMS 通道'],3:['✅','email 通道'],4:['✅','website forms'],5:['🟡','social 导入未接'],6:['🟡','POS 通道未接'],7:['🟡','生态 API 未接'] };
const aud = { 1:['✅','AuditLog 实体+页'],2:['✅','userId'],3:['✅','organisationId'],4:['🟡','branchId 部分'],5:['✅','action'],6:['✅','entity'],7:['✅','timestamp'],8:['✅','before/after JSON'],9:['✅','登录审计'],10:['🟡','权限变更审计未埋'],11:['✅','禁用审计'],12:['🟡','库存调整审计待埋'],13:['✅','LOYALTY_ADJUST（实测）'],14:['🟡','导出审计未埋'],15:['✅','不可篡改（App 不可写）'] };
const sec = { 1:['🟡','HTTPS 生产'],2:['🟡','加密生产'],3:['✅','scrypt 哈希'],4:['✅','Prisma 参数化'],5:['✅','React 转义'],6:['🟡','CSRF 生产'],7:['✅','上传类型校验'],8:['✅','10MB 限制'],9:['✅','密钥不暴露前端'],10:['✅','tenant 查询校验'],11:['✅','server 权限校验'],12:['✅','不写敏感日志'],13:['🟡','密钥管理生产'],14:['🟡','备份加密生产'],15:['🟡','依赖维护'],16:['🟡','生产访问控制'],17:['✅','认证会话'] };
const priv = { 1:['✅','CustomerConsent'],2:['✅','营销/交易区分'],3:['✅','opt-out 拦截'],4:['✅','权限内联系信息'],5:['✅','导出权限'],6:['🟡','数据请求响应未做'],7:['🟡','保留策略未配置'],8:['✅','删除不破坏审计'],9:['🟡','MY PDPA 生产合规'] };
for (let i = 1; i <= 9; i++) seg14['API-' + String(i).padStart(3, '0')] = api[i];
for (let i = 1; i <= 7; i++) seg14['INT-' + String(i).padStart(3, '0')] = int[i];
for (let i = 1; i <= 15; i++) seg14['AUDIT-' + String(i).padStart(3, '0')] = aud[i];
for (let i = 1; i <= 17; i++) seg14['SEC-' + String(i).padStart(3, '0')] = sec[i];
for (let i = 1; i <= 9; i++) seg14['PRIV-' + String(i).padStart(3, '0')] = priv[i];
const start = md.indexOf('## 段 14：');
const end = md.indexOf('## 段 15：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg14)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 14 | API/集成/审计/安全/隐私[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
