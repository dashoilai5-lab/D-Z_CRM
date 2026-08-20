
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg8 = {
'PART-001':['✅','products 目录页'],'PART-002':['✅','唯一内部 id'],'PART-003':['✅','SKU unique'],'PART-004':['✅','manufacturerPartNo 已补'],
'PART-005':['✅','name'],'PART-006':['✅','category'],'PART-007':['✅','compatibleModels'],'PART-008':['✅','costPriceSen'],'PART-009':['✅','sellPriceSen'],
'PART-010':['✅','supplier'],'PART-011':['✅','barcode 已补'],'PART-012':['✅','active'],
'INV-001':['✅','按分支 Inventory'],'INV-002':['✅','quantity on hand'],'INV-003':['✅','可用=现有（无预留）'],'INV-004':['✅','minStock'],
'INV-005':['✅','alerts 低库存'],'INV-006':['✅','OUT_OF_STOCK'],'INV-007':['✅','PO 收货'],'INV-008':['✅','工单消耗/调整'],
'INV-009':['✅','Adjust UI（stock 页）'],'INV-010':['✅','分支转移（实测双向 ledger）'],'INV-011':['✅','StockMovement 全记录'],'INV-012':['✅','userId 字段'],
'INV-013':['✅','createdAt'],'INV-014':['✅','reason'],'INV-015':['✅','工单消耗扣库存'],'INV-016':['✅','ServiceJobPart 关联'],
'INV-017':['✅','SKU 搜索'],'INV-018':['✅','名称/分类搜索'],'INV-019':['✅','描述搜索'],'INV-020':['✅','兼容车型（compatibleModels）'],
'INV-021':['✅','minStock 可配置'],'INV-022':['🟡','分支对比报表未做（stock 按分支查）'],
};
const start = md.indexOf('## 段 8：');
const end = md.indexOf('## 段 9：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg8)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 8 | 零件与库存[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
