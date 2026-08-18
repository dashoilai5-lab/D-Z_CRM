import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Global search endpoint (§18): customers, motorcycles, jobs, products. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ hits: [] });
  const hits: { type: "customer" | "motorcycle" | "job" | "product"; label: string; sub: string; href: string }[] = [];

  const customers = await db.customer.findMany({
    where: { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { motorcycles: { some: { plate: { contains: q } } } }] },
    include: { motorcycles: true },
    take: 5,
  });
  for (const c of customers) {
    hits.push({ type: "customer", label: c.name, sub: (c.phone ?? "") + " · " + c.motorcycles.map((m) => m.plate).join(", "), href: "/workshop/customers/" + c.id });
  }

  const bikes = await db.motorcycle.findMany({
    where: { OR: [{ plate: { contains: q } }, { model: { contains: q } }, { brand: { contains: q } }] },
    include: { customer: true },
    take: 5,
  });
  for (const b of bikes) {
    hits.push({ type: "motorcycle", label: b.brand + " " + b.model + " · " + b.plate, sub: b.customer.name + " · " + b.currentMileage.toLocaleString() + " km", href: "/workshop/customers/" + b.customerId });
  }

  const jobs = await db.serviceJob.findMany({ where: { jobNumber: { contains: q.toUpperCase() } }, include: { customer: true }, take: 5 });
  for (const j of jobs) {
    hits.push({ type: "job", label: j.jobNumber + " · " + (j.packageName ?? "Service"), sub: j.customer.name + " · " + j.status, href: "/workshop/jobs/" + j.id });
  }

  const products = await db.product.findMany({ where: { OR: [{ name: { contains: q } }, { sku: { contains: q.toUpperCase() } }] }, take: 5 });
  for (const p of products) {
    hits.push({ type: "product", label: p.name, sub: p.sku + " · RM" + (p.sellPriceSen / 100), href: "/workshop/inventory/stock" });
  }

  return NextResponse.json({ hits });
}
