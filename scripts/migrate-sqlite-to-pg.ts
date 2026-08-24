#!/usr/bin/env tsx
/**
 * SQLite → PostgreSQL 数据迁移脚本（骨架）
 * ==============================================
 * 用途：阶段 A1 —— 把本地原型数据（prisma/dev.db）迁移到生产 Postgres
 *       （Supabase）。对应 docs/DEPLOYMENT_CHECKLIST.md A1「数据迁移脚本」。
 *
 * 设计要点
 * --------
 * 1. 源端用 PrismaClient（SQLite provider 生成，天然匹配 dev.db）。
 * 2. 目标端用 `pg`（node-postgres）直连 —— Prisma Client 的 provider
 *    在 generate 时固定（sqlite），同一 client 无法连 Postgres；
 *    schema 迁移（migrate deploy）由部署流程负责，本脚本只搬数据。
 * 3. 表/列名 = Prisma 模型/字段名（schema 无 @map/@@map，无需映射表）。
 * 4. 依赖顺序：从 dmmf 读关系字段构建依赖图，父表先于子表插入；
 *    环（双向关系）按字母序兜底 —— 真实迁移若遇 FK 失败，用 --models
 *    分批发或按报告调整顺序。
 * 5. 幂等：INSERT ... ON CONFLICT (id) DO NOTHING；--truncate 可先清目标表。
 *
 * 用法
 * ----
 *   # 先跑 dry-run（只连源库统计行数，不碰目标）
 *   pnpm exec tsx scripts/migrate-sqlite-to-pg.ts --dry-run
 *
 *   # 真实迁移（目标连接串二选一：--dst 或环境变量 DST_DATABASE_URL）
 *   pnpm exec tsx scripts/migrate-sqlite-to-pg.ts \
 *     --dst "postgresql://user:pass@host:5432/db?schema=public"
 *
 *   # 只迁部分模型 / 先清目标表 / 调批大小
 *   pnpm exec tsx scripts/migrate-sqlite-to-pg.ts --models Customer,Motorcycle
 *   pnpm exec tsx scripts/migrate-sqlite-to-pg.ts --truncate --batch 1000
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";

// ---------------------------------------------------------------------------
// 命令行参数
// ---------------------------------------------------------------------------
interface Args {
  srcUrl: string;      // SQLite URL（默认 .env 的 DATABASE_URL 或 file:./dev.db）
  dstUrl: string;      // Postgres URL（--dst 或 DST_DATABASE_URL，真实迁移必填）
  models?: string[];   // 白名单模型（缺省=全部）
  dryRun: boolean;     // 只统计不写
  truncate: boolean;   // 迁移前 TRUNCATE 目标表
  batch: number;       // 每批 INSERT 行数
  failFast: boolean;   // 单表失败即退出（默认继续并报告）
}

function parseArgs(argv: string[]): Args {
  const a: Args = {
    srcUrl: process.env.DATABASE_URL ?? "file:./dev.db",
    dstUrl: process.env.DST_DATABASE_URL ?? "",
    dryRun: false,
    truncate: false,
    batch: 500,
    failFast: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    const next = () => argv[++i];
    if (v === "--dry-run") a.dryRun = true;
    else if (v === "--truncate") a.truncate = true;
    else if (v === "--fail-fast") a.failFast = true;
    else if (v === "--src") a.srcUrl = next();
    else if (v === "--dst") a.dstUrl = next();
    else if (v === "--models") a.models = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (v === "--batch") a.batch = Number(next());
    else if (v.startsWith("--")) { console.error(`unknown option: ${v}`); process.exit(2); }
  }
  if (!a.dstUrl && !a.dryRun) {
    console.error("缺少目标连接串：--dst <postgres url> 或环境变量 DST_DATABASE_URL（dry-run 除外）");
    process.exit(2);
  }
  return a;
}

// ---------------------------------------------------------------------------
// dmmf 元数据辅助（模型、列、依赖）
// ---------------------------------------------------------------------------
interface ModelInfo {
  name: string;
  columns: string[];        // 需 INSERT 的列（scalar + enum，排除自增列）
  deps: string[];           // 依赖的模型（relation 字段指向的模型名）
  autoIncColumns: string[]; // 自增列（insert 时排除，让目标 DB 生成）
}

function buildModels(whitelist?: string[]): ModelInfo[] {
  const datamodel = Prisma.dmmf.datamodel;
  const models = datamodel.models
    .filter((m) => !whitelist || whitelist.includes(m.name))
    .map((m) => {
      // isAutoIncrement 不在 dmmf 字段类型声明里（SQLite 无自增 id），用断言访问
      const autoIncColumns = m.fields
        .filter((f) => f.isId && (f as { isAutoIncrement?: boolean }).isAutoIncrement)
        .map((f) => f.name);
      const columns = m.fields
        .filter((f) => (f.kind === "scalar" || f.kind === "enum") && !autoIncColumns.includes(f.name))
        .map((f) => f.name);
      // 关系依赖：仅统计持有外键的方向（relationFromFields 非空）。
      // Prisma dmmf 的 object 字段是双向的（父模型也有反向数组字段），
      // 若全部计入会形成环；只有携带 FK 列的一方才是子表（依赖方）。
      const deps = [...new Set(
        m.fields
          .filter((f) => f.kind === "object" && f.type !== m.name && (f as { relationFromFields?: string[] }).relationFromFields?.length)
          .map((f) => f.type),
      )];
      return { name: m.name, columns, deps, autoIncColumns };
    });
  return models;
}

/** 拓扑排序（父表先）。有环时环内按字母序兜底。 */
function topoSort(models: ModelInfo[]): ModelInfo[] {
  const byName = new Map(models.map((m) => [m.name, m]));
  const visited = new Set<string>();
  const order: ModelInfo[] = [];
  const visiting = new Set<string>();
  const visit = (name: string) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) return; // 环：跳过，稍后兜底
    visiting.add(name);
    for (const d of byName.get(name)?.deps ?? []) visit(d);
    visiting.delete(name);
    visited.add(name);
    const m = byName.get(name);
    if (m) order.push(m);
  };
  // 先按依赖深度稳定排序：deps 少（父表）的优先被 visit
  const sorted = [...models].sort((a, b) => a.deps.length - b.deps.length || a.name.localeCompare(b.name));
  for (const m of sorted) visit(m.name);
  // 环内兜底：把未访问的按字母序补上
  for (const m of [...models].sort((a, b) => a.name.localeCompare(b.name))) {
    if (!visited.has(m.name)) { visited.add(m.name); order.push(m); }
  }
  return order;
}

// ---------------------------------------------------------------------------
// 值转换：SQLite(Prisma) → PG 参数
// ---------------------------------------------------------------------------
function toPgValue(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;            // pg 自动转 timestamptz
  if (typeof v === "boolean" || typeof v === "number" || typeof v === "string") return v;
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v) || typeof v === "object") return JSON.stringify(v); // 兜底（schema 目前无 Json 列）
  return String(v);
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const models = topoSort(buildModels(args.models));
  console.log(`[migrate] 模型 ${models.length} 个（拓扑序）：${models.map((m) => m.name).join(", ")}`);
  if (args.models) console.log(`[migrate] 白名单模式：仅 ${args.models.join(", ")}`);

  // 源：SQLite
  const src = new PrismaClient({ datasourceUrl: args.srcUrl });
  await src.$connect();
  console.log(`[migrate] 源 SQLite 已连接：${args.srcUrl}`);

  // 目标：PG（真实迁移才连）
  let dst: Pool | null = null;
  if (!args.dryRun) {
    // Supabase 用自签证书链，pg 8.23 的 sslmode=require 会按 verify-full 校验而失败；
    // 一次性迁移场景放宽证书校验（应用运行时连接另配正式证书策略）。
    const isSupabase = /supabase\.co/.test(args.dstUrl);
    dst = new Pool({
      connectionString: args.dstUrl,
      max: 5,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
    await dst.query("SELECT 1");
    console.log(`[migrate] 目标 Postgres 已连接：${args.dstUrl.replace(/:[^:@]+@/, ":***@")}`);
    if (args.truncate) {
      for (const m of models) {
        await dst.query(`TRUNCATE TABLE "${m.name}" CASCADE`);
      }
      console.log(`[migrate] 目标表已清空（${models.length} 张）`);
    }
  }

  const report: { model: string; source: number; inserted: number; skipped: number; ms: number; error?: string }[] = [];
  const t0 = Date.now();

  for (const m of models) {
    const t1 = Date.now();
    try {
      // 读源（列名 = 字段名，直接取全量）
      const rows = await src.$queryRawUnsafe(`SELECT * FROM "${m.name}"`) as Record<string, unknown>[];
      if (args.dryRun) {
        report.push({ model: m.name, source: rows.length, inserted: 0, skipped: 0, ms: Date.now() - t1 });
        continue;
      }
      if (rows.length === 0) {
        report.push({ model: m.name, source: 0, inserted: 0, skipped: 0, ms: Date.now() - t1 });
        continue;
      }
      const cols = m.columns;
      const colList = cols.map((c) => `"${c}"`).join(", ");
      let inserted = 0;
      let skipped = 0;
      for (let i = 0; i < rows.length; i += args.batch) {
        const chunk = rows.slice(i, i + args.batch);
        const values: unknown[] = [];
        const placeholders: string[] = [];
        chunk.forEach((row, rIdx) => {
          const p: string[] = [];
          cols.forEach((c, cIdx) => {
            values.push(toPgValue(row[c]));
            p.push(`$${rIdx * cols.length + cIdx + 1}`);
          });
          placeholders.push(`(${p.join(", ")})`);
        });
        const sql = `INSERT INTO "${m.name}" (${colList}) VALUES ${placeholders.join(", ")} ON CONFLICT (id) DO NOTHING`;
        const res = await dst!.query(sql, values);
        inserted += res.rowCount ?? 0;
        skipped += chunk.length - (res.rowCount ?? 0);
      }
      report.push({ model: m.name, source: rows.length, inserted, skipped, ms: Date.now() - t1 });
    } catch (e) {
      const err = String((e as Error)?.message ?? e).slice(0, 300);
      report.push({ model: m.name, source: -1, inserted: 0, skipped: 0, ms: Date.now() - t1, error: err });
      console.error(`  ✗ ${m.name}: ${err}`);
      if (args.failFast) { await src.$disconnect(); await dst?.end(); process.exit(1); }
    }
  }

  const totalMs = Date.now() - t0;
  console.log("\n== 迁移报告 ==");
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log(`${pad("模型", 26)} ${pad("源行数", 8)} ${pad("插入", 8)} ${pad("跳过", 8)} ${pad("耗时", 8)} 备注`);
  let sumSrc = 0, sumIns = 0, fail = 0;
  for (const r of report) {
    sumSrc += Math.max(r.source, 0); sumIns += r.inserted;
    if (r.error) fail++;
    const note = r.error ? `失败：${r.error.slice(0, 80)}` : r.source === -1 ? "失败" : "";
    console.log(`${pad(r.model, 26)} ${pad(String(r.source), 8)} ${pad(String(r.inserted), 8)} ${pad(String(r.skipped), 8)} ${pad(`${r.ms}ms`, 8)} ${note}`);
  }
  console.log(`\n合计：源 ${sumSrc} 行 / 插入 ${sumIns} 行 / 失败表 ${fail} 张 / 总耗时 ${totalMs}ms`);
  if (args.dryRun) {
    console.log("[dry-run] 未连接目标库、未写入任何数据。加 --dst <postgres url> 执行真实迁移。");
  } else if (fail > 0) {
    console.log("[migrate] ⚠️ 有表失败。常见原因：FK 顺序 / 重复 id / PG 约束。用 --models 分批发或 --fail-fast 定位。");
  } else {
    console.log("[migrate] ✅ 全部完成。建议在目标库跑一次计数校验（源行数 == 目标行数）。");
  }

  await src.$disconnect();
  await dst?.end();
}

main().catch((e) => { console.error(String(e)); process.exit(1); });
