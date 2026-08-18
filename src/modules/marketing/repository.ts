import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike } from "@/modules/customers/repository";

export interface IMarketingRepository {
  listCampaigns(client?: DbLike): Promise<Prisma.CampaignGetPayload<{ include: { branch: true } }>[]>;
  listAssets(client?: DbLike): Promise<Prisma.MarketingAssetGetPayload<{ include: { branch: true } }>[]>;
  listScripts(client?: DbLike): Promise<Prisma.ContentScriptGetPayload<{ include: { branch: true } }>[]>;
}

export type { DbLike } from "@/modules/customers/repository";
