import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, IMarketingRepository } from "@/modules/marketing/repository";
import { db } from "@/lib/db";

export class PrismaMarketingRepository implements IMarketingRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient { return client ?? db; }
  listCampaigns(client?: DbLike) { return this.c(client).campaign.findMany({ include: { branch: true }, orderBy: { startDate: "desc" } }); }
  listAssets(client?: DbLike) { return this.c(client).marketingAsset.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }); }
  listScripts(client?: DbLike) { return this.c(client).contentScript.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }); }
  createCampaign(data: Prisma.CampaignUncheckedCreateInput, client?: DbLike) { return this.c(client).campaign.create({ data }); }
  createAsset(data: Prisma.MarketingAssetUncheckedCreateInput, client?: DbLike) { return this.c(client).marketingAsset.create({ data }); }
  createScript(data: Prisma.ContentScriptUncheckedCreateInput, client?: DbLike) { return this.c(client).contentScript.create({ data }); }
}
