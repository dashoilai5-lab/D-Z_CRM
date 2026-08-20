
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg10 = {
'LOY-001':['✅','账户+等级系统'],'LOY-002':['✅','membershipId'],'LOY-003':['✅','多等级'],'LOY-004':['✅','seed 3 等级'],'LOY-005':['🟡','等级配置 UI 归 ADMIN'],
'LOY-006':['✅','benefits'],'LOY-007':['✅','tier 显示'],'LOY-008':['🟡','进度条未做'],'LOY-009':['✅','memberSince'],'LOY-010':['✅','rider 数字会员卡'],
'LOY-011':['✅','积分系统'],'LOY-012':['✅','LoyaltyTransaction 账本'],'LOY-013':['✅','earn（实测 145 分）'],'LOY-014':['✅','redeem'],'LOY-015':['✅','adjust'],
'LOY-016':['🟡','过期未实现'],'LOY-017':['✅','服务完成发积分'],'LOY-018':['🟡','购买积分未接'],'LOY-019':['✅','推荐发积分'],'LOY-020':['🟡','促销积分未接'],
'LOY-021':['✅','账本可审计'],'LOY-022':['✅','rider 可见'],'LOY-023':['✅','staff 管理页'],'LOY-024':['✅','余额不足拒绝'],
'LOY-025':['🟡','reward 创建 UI 归 ADMIN（seed 2 个）'],'LOY-026':['✅','pointsRequired'],'LOY-027':['✅','active'],'LOY-028':['✅','兑换记录'],'LOY-029':['✅','单次防重复'],
'REF-001':['✅','推荐码生成'],'REF-002':['✅','referringCustomer'],'REF-003':['✅','referred'],'REF-004':['✅','status 跟踪'],'REF-005':['🟡','奖励条件固定 200 分'],
'REF-006':['✅','qualify 后发奖'],'REF-007':['✅','接入积分'],'REF-008':['✅','列表可报表'],'REF-009':['✅','防自荐'],
'MKT-001':['✅','campaign 模块'],'MKT-002':['✅','name'],'MKT-003':['✅','startDate'],'MKT-004':['✅','endDate'],'MKT-005':['🟡','audience 字符串字段'],
'MKT-006':['🟡','tags 过滤未做'],'MKT-007':['🟡','branch 过滤未做'],'MKT-008':['🟡','ownership 过滤未做'],'MKT-009':['🟡','service history 过滤未做'],
'MKT-010':['🟡','inactive 过滤未做'],'MKT-011':['🟡','tier 过滤未做'],'MKT-012':['🟡','群发 opt-out 检查待补'],'MKT-013':['✅','discountPercent 促销'],'MKT-014':['🟡','积分促销未接'],
'MKT-015':['✅','campaignId 归因 booking'],'MKT-016':['✅','归因可查'],'MKT-017':['🟡','revenue 归因未接'],
};
const start = md.indexOf('## 段 10：');
const end = md.indexOf('## 段 11：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg10)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 10 | 忠诚度/推荐/营销活动[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
