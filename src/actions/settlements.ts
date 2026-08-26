"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseSalaryRules, type SalaryRules } from "@/modules/staff/service";
import { getSessionUser } from "@/lib/session-user";

/** 保存薪资规则（仅 OWNER 可改）。 */
export async function updateSalaryRules(input: { baseSen: number; commissionType: SalaryRules["commissionType"]; commissionValue: number; addonBonusSen?: number }) {
  const session = await getSessionUser();
  if (session.kind !== "staff" || session.role !== "OWNER") return { ok: false as const, error: "Owner access required" };

  const org = await db.organisation.findFirst();
  if (!org) return { ok: false as const, error: "No organisation" };

  const next: SalaryRules = {
    baseSen: Math.max(0, Math.round(input.baseSen)),
    commissionType: input.commissionType,
    commissionValue: Math.max(0, Math.round(input.commissionValue)),
    addonBonusSen: Math.max(0, Math.round(input.addonBonusSen ?? 0)),
  };
  // 校验通过 parseSalaryRules 归一
  await db.organisation.update({ where: { id: org.id }, data: { salaryRules: parseSalaryRules(next) as never } });
  revalidatePath("/workshop/settlements");
  return { ok: true as const };
}
