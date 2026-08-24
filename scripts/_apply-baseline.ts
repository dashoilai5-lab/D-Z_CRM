import { Pool } from "pg";
import "dotenv/config";
import * as fs from "node:fs";
async function main() {
  const url = process.env.DST_DATABASE_URL!;
  const pool = new Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 20000, ssl: { rejectUnauthorized: false } });
  const sql = fs.readFileSync("docs/pg-baseline.sql", "utf8");
  // 去掉注释行（pg 不支持 -- 注释批量执行？实际支持，但去掉更稳）
  const clean = sql.split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
  // 按语句拆分（CREATE TYPE/TABLE/ALTER/INDEX，无函数体分号问题）
  const stmts = clean.split(";").map(s => s.trim()).filter(s => s.length > 0);
  console.log("statements:", stmts.length);
  let ok = 0, err = 0;
  for (let i = 0; i < stmts.length; i++) {
    try { await pool.query(stmts[i]); ok++; }
    catch (e) {
      const msg = String((e as Error).message).slice(0, 120);
      // 已存在错误（重复执行）不算失败
      if (/already exists/.test(msg)) { console.log("  skip (exists):", stmts[i].slice(0, 60)); continue; }
      err++;
      console.error("  ✗", stmts[i].slice(0, 80), "::", msg);
    }
  }
  console.log(`done: ok=${ok} skip-exists=${stmts.length - ok - err} err=${err}`);
  await pool.end();
}
main().catch((e) => { console.error("FATAL:", String(e.message).slice(0, 400)); process.exit(1); });
