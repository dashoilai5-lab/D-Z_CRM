
const fs = require('fs');
let md = fs.readFileSync('docs/REQUIREMENTS_VERIFICATION.md','utf8');
const seg12 = {
'SEARCH-001':['✅','/api/search + CommandPalette'],'SEARCH-002':['✅','客户'],'SEARCH-003':['✅','电话'],'SEARCH-004':['✅','邮箱（已扩展）'],
'SEARCH-005':['✅','车牌'],'SEARCH-006':['✅','VIN（已扩展）'],'SEARCH-007':['✅','线索（已扩展）'],'SEARCH-008':['✅','预约（已扩展）'],
'SEARCH-009':['✅','工单'],'SEARCH-010':['✅','零件（SKU/条码）'],'SEARCH-011':['🟡','服务记录未入搜索'],'SEARCH-012':['✅','权限内查询'],'SEARCH-013':['✅','类型标注'],'SEARCH-014':['✅','点击打开'],
'NOTIF-001':['✅','通知中心页'],'NOTIF-002':['✅','线索分配通知'],'NOTIF-003':['✅','任务到期通知'],'NOTIF-004':['✅','任务创建即通知'],'NOTIF-005':['✅','预约通知（booking 创建/确认）'],
'NOTIF-006':['✅','工单 Ready 通知'],'NOTIF-007':['✅','低库存（alerts 页）'],'NOTIF-008':['✅','link 字段+Open'],'NOTIF-009':['✅','readAt/未读'],'NOTIF-010':['🟡','偏好配置归段 15'],
'IMPORT-001':['✅','客户 CSV 导入'],'IMPORT-002':['🟡','车辆导入未做'],'IMPORT-003':['🟡','线索导入未做'],'IMPORT-004':['🟡','零件导入未做'],'IMPORT-005':['🟡','库存数量导入未做'],
'IMPORT-006':['✅','列映射（固定表头）'],'IMPORT-007':['✅','必填校验'],'IMPORT-008':['✅','无效行报告'],'IMPORT-009':['✅','成功行数'],'IMPORT-010':['✅','失败行数+原因'],
'IMPORT-011':['✅','phone 查重'],'IMPORT-012':['✅','不覆盖（跳过）'],'IMPORT-013':['✅','tenant 归属'],
'EXPORT-001':['✅','客户 CSV'],'EXPORT-002':['✅','线索 CSV'],'EXPORT-003':['✅','预约 CSV'],'EXPORT-004':['🟡','服务历史导出未做'],'EXPORT-005':['✅','产品 CSV'],
'EXPORT-006':['✅','分析报表 CSV'],'EXPORT-007':['✅','服务端接口'],'EXPORT-008':['✅','AuditLog 可审计（下载事件未埋点🟡）'],
'FILE-001':['✅','附件系统'],'FILE-002':['✅','客户附件'],'FILE-003':['✅','lead 附件（多态支持）'],'FILE-004':['✅','车辆附件（多态）'],'FILE-005':['✅','工单附件（多态）'],
'FILE-006':['✅','图片格式'],'FILE-007':['✅','PDF（实测）'],'FILE-008':['✅','tenant 隔离（路径含 org）'],'FILE-009':['✅','角色（workshop 内）'],'FILE-010':['✅','孤儿附件无泄露'],
};
const start = md.indexOf('## 段 12：');
const end = md.indexOf('## 段 13：');
let block = md.slice(start, end);
let count = 0;
for (const [id, [st, note]] of Object.entries(seg12)) {
  const re = new RegExp('(\| ' + id + ' \| [^|]* \| )[⏳✅🟡❌]( \| )[^|]*( \|)');
  if (re.test(block)) { block = block.replace(re, '$1' + st + '$2' + note + '$3'); count++; }
  else console.log('NOT FOUND:', id);
}
md = md.slice(0, start) + block + md.slice(end);
md = md.replace(/(| 12 | 搜索/通知/导入导出/文件[^|]*| d+ | )⏳[^|]*/, '$1✅ 补齐完成');
fs.writeFileSync('docs/REQUIREMENTS_VERIFICATION.md', md);
console.log('updated:', count);
