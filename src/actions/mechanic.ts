"use server";

import { revalidatePath } from "next/cache";
import { inspectionService } from "@/modules/inspections/service";
import type { CheckResult } from "@prisma/client";

export async function startChecklist(jobId: string) {
  const exec = await inspectionService.startChecklist(jobId);
  revalidatePath("/", "layout");
  return { ok: true, executionId: exec?.id };
}

export async function setChecklistResult(jobId: string, executionItemId: string, result: CheckResult, note?: string) {
  await inspectionService.setResult(jobId, executionItemId, result, note);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function requestApproval(input: {
  jobId: string; executionItemId?: string; title: string; severity: "WARNING" | "FAIL";
  note: string; recommendedRepair: string; priceSen: number;
}) {
  await inspectionService.requestApproval(input);
  revalidatePath("/", "layout");
  return { ok: true };
}
