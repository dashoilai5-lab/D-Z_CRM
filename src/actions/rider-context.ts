"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * QR-003：Rider 扫码确认进入门店 → 记录当前服务门店（cookie），跳回 rider 首页。
 */
export async function setWorkshopContext(formData: FormData) {
  const organisationId = String(formData.get("organisationId") ?? "");
  const branchId = String(formData.get("branchId") ?? "");
  const store = await cookies();
  if (organisationId) store.set("dz_org", organisationId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  if (branchId) store.set("dz_branch", branchId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
  redirect("/rider/home");
}
