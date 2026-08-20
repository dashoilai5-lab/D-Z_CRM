"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export interface PackageItemInput {
  name: string;
  kind: "SERVICE" | "PART" | "GIFT";
  defaultQty?: number;
  priceSen?: number;
  productId?: string | null;
}

/** Update a package and rewrite its item set (diff-based delete + create). */
export async function updatePackage(id: string, input: { name?: string; priceSen?: number; description?: string | null; isBestValue?: boolean; active?: boolean; items?: PackageItemInput[] }) {
  const pkg = await db.servicePackage.findUnique({ where: { id }, include: { items: true } });
  if (!pkg) return { ok: false, error: "Package not found" };
  await db.$transaction(async (tx) => {
    await tx.servicePackage.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        priceSen: input.priceSen ?? undefined,
        description: input.description ?? undefined,
        isBestValue: input.isBestValue ?? undefined,
        active: input.active ?? undefined,
      },
    });
    if (input.items) {
      const existing = new Map(pkg.items.map((i) => [i.id, i]));
      const currentIds = new Set<string>();
      for (const item of input.items) {
        const match = [...existing.values()].find((e) => e.name === item.name && e.kind === item.kind);
        if (match) {
          await tx.servicePackageItem.update({
            where: { id: match.id },
            data: { name: item.name, kind: item.kind, defaultQty: item.defaultQty ?? 1, priceSen: item.priceSen ?? 0, productId: item.productId ?? null },
          });
          currentIds.add(match.id);
        } else {
          const created = await tx.servicePackageItem.create({
            data: { packageId: id, name: item.name, kind: item.kind, defaultQty: item.defaultQty ?? 1, priceSen: item.priceSen ?? 0, productId: item.productId ?? null },
          });
          currentIds.add(created.id);
        }
      }
      for (const e of existing.values()) {
        if (!currentIds.has(e.id)) await tx.servicePackageItem.delete({ where: { id: e.id } });
      }
    }
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createPackage(input: { name: string; priceSen: number; tier: string; items?: PackageItemInput[] }) {
  const org = await db.organisation.findFirst();
  const pkg = await db.servicePackage.create({
    data: {
      name: input.name,
      tier: input.tier as "GOOD" | "BETTER" | "BEST",
      priceSen: input.priceSen,
      items: input.items ? { create: input.items.map((i) => ({ name: i.name, kind: i.kind, defaultQty: i.defaultQty ?? 1, priceSen: i.priceSen ?? 0, productId: i.productId ?? null })) } : undefined,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true, id: pkg.id };
}
