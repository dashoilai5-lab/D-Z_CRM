# Supabase 阶段 A1 执行指南（数据库迁移）

> 目标：把本地 SQLite（dev.db）迁移到 Supabase Postgres。对应 DEPLOYMENT_CHECKLIST.md A1。
> 前置：Supabase 账号已注册、项目已创建（有 Project URL / anon key / service role key / DB 连接串）。
> 时间预估：30-60 分钟（不含等待）。

## 背景：为什么不能直接 prisma migrate deploy

本项目 prisma/schema.prisma 的 datasource provider 锁定 **sqlite**，且 17 个迁移文件均为 SQLite 方言。
直接对 PG 跑 migrate deploy 会失败。替代方案（已验证可行）：

- 用 `prisma migrate diff --from-empty` 离线生成 PG 基线 SQL（61 表 / 21 enum / 1409 行，无 SQLite 残留）
- 在 Supabase 执行该基线 SQL 建表
- 用 `scripts/migrate-sqlite-to-pg.ts` 搬数据（PrismaClient 读 SQLite + pg 库写 PG）

---

## 第 0 步：收集连接信息（Supabase Dashboard）

登录 supabase.com → 你的项目：

| 信息 | 位置 | 用途 | 是否秘密 |
| --- | --- | --- | --- |
| Project URL | Project Settings → API → Project URL | 前端 SDK（A3 用） | 否 |
| anon public key | Project Settings → API → anon public | 前端 SDK（A3 用） | 否 |
| service_role key | Project Settings → API → service_role | 服务端（A2 RLS 用） | **是** |
| DB 连接串（直连） | Project Settings → Database → Connection string → URI | 数据迁移 | **是**（含密码） |

**连接串格式**（两种，选直连）：

```
# 直连（推荐迁移用）：
postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres
# 事务连接池（应用运行时用，A3 之后）：
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

> 密码含特殊字符时 URL 需编码（如 @ → %40）。可直接用 Dashboard 复制的完整 URI。

---

## 第 1 步：把连接串写入 .env（用户操作）

编辑 `.env`（已 gitignore，不会提交）追加：

```env
# --- Supabase（阶段 A1 迁移）---
DST_DATABASE_URL="postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require"
# --- Supabase（阶段 A2/A3 用，先留着）---
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
```

> 注意：现有 `DATABASE_URL="file:./dev.db"` 保留不动（本地 dev/e2e 继续用 SQLite）。
> 迁移脚本读 `DST_DATABASE_URL`（或 `--dst` 参数），不覆盖本地路径。

---

## 第 2 步：建表（在 Supabase 执行基线 SQL）

### 方式 A：Supabase SQL Editor（推荐，可视化）

1. Supabase Dashboard → **SQL Editor** → New query
2. 打开本地文件 `docs/pg-baseline.sql`，全选复制全部内容
3. 粘贴到编辑器 → **Run**（等待完成，61 张表 + 21 个 enum）
4. 确认输出无错误（表已存在的报错说明重复执行过，可忽略）

### 方式 B：本地 psql 执行

```bash
psql "$DST_DATABASE_URL" -f docs/pg-baseline.sql
```

### 验证建表

```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema='public';  -- 期望 61
```

---

## 第 3 步：数据迁移（本地执行）

```bash
# 先 dry-run 确认源读取正常（不连目标）
pnpm exec tsx scripts/migrate-sqlite-to-pg.ts --dry-run

# 真实迁移（目标连接串来自 .env 的 DST_DATABASE_URL）
pnpm exec tsx scripts/migrate-sqlite-to-pg.ts

# 或显式传连接串
pnpm exec tsx scripts/migrate-sqlite-to-pg.ts --dst "$DST_DATABASE_URL"
```

脚本行为：
- 拓扑序插入（父表先）：Organisation → Branch → User → ... → Booking → ...
- 幂等：INSERT ... ON CONFLICT (id) DO NOTHING（重复跑安全）
- 默认不 TRUNCATE 目标表（首次迁移目标为空，无需清）
- 单表失败会继续并报告，最后给汇总

预期输出：`合计：源 5060 行 / 插入 5060 行 / 失败表 0 张`

---

## 第 4 步：验证（Supabase SQL Editor）

```sql
SELECT 'Customer' t, count(*) FROM "Customer"
UNION ALL SELECT 'Motorcycle', count(*) FROM "Motorcycle"
UNION ALL SELECT 'ServiceJob', count(*) FROM "ServiceJob"
UNION ALL SELECT 'Booking', count(*) FROM "Booking"
UNION ALL SELECT 'Invoice', count(*) FROM "Invoice"
UNION ALL SELECT 'Product', count(*) FROM "Product"
UNION ALL SELECT 'User', count(*) FROM "User";
```

期望（与 dry-run 一致）：Customer 104 / Motorcycle 136 / ServiceJob 169 / Booking 29 / Invoice 146 / Product 82 / User 8。

---

## 第 5 步：收尾

1. 更新 `docs/DEPLOYMENT_CHECKLIST.md` A1 前四项打勾（建项目 / DATABASE_URL / 建表 / 数据迁移）
2. SETUP §9 台账追加一行
3. 后续阶段（A2 RLS / A3 Auth / A4 demo 清理）另案推进

## 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| ECONNREFUSED / timeout | 免费项目暂停（7 天无活动）或连接串错 | Dashboard 恢复项目；核对 host/端口/密码 |
| password authentication failed | 密码错或含未编码字符 | 重新复制 URI；密码特殊字符 URL 编码 |
| 某表 FK 失败 | 拓扑环（双向关系） | 用 --models 分批发父表先，或 --fail-fast 定位 |
| 表已存在报错 | 基线 SQL 重复执行 | 忽略（幂等） |
| sslmode 报错 | 连接串缺 ssl | 追加 ?sslmode=require |
