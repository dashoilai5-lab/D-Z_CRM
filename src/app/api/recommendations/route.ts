import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/modules/ai/service";

export async function GET(req: NextRequest) {
  const motorcycleId = req.nextUrl.searchParams.get("motorcycleId") ?? "";
  const mileage = Number(req.nextUrl.searchParams.get("mileage") ?? 0);
  if (!motorcycleId) return NextResponse.json({ recs: [] });
  const recs = await aiService.salesRecommendationsForMotorcycle(motorcycleId, mileage);
  return NextResponse.json({ recs });
}
