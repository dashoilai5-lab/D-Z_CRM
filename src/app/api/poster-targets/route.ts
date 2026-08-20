import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Poster broadcast targets — customers filtered by tag. */
export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get("tag") ?? "";
  const org = await db.organisation.findFirst();
  const customers = await db.customer.findMany({
    where: { organisationId: org!.id, ...(tag ? { tags: { contains: tag } } : {}) },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true, tags: true },
    take: 100,
  });
  return NextResponse.json({ customers });
}
