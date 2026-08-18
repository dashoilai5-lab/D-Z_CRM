import type { IMarketingRepository } from "./repository";
import { PrismaMarketingRepository } from "@/repositories/prisma/marketing.repository";

export class MarketingService {
  constructor(private repo: IMarketingRepository = new PrismaMarketingRepository()) {}

  async overview() {
    const [campaigns, assets, scripts] = await Promise.all([
      this.repo.listCampaigns(),
      this.repo.listAssets(),
      this.repo.listScripts(),
    ]);
    return {
      campaigns: campaigns.map((c) => ({ id: c.id, name: c.name, type: c.type, status: c.status, startDate: c.startDate, endDate: c.endDate, branch: c.branch.city })),
      assets: assets.map((a) => ({ id: a.id, title: a.title, type: a.type, month: a.month, description: a.description })),
      scripts: scripts.map((s) => ({ id: s.id, title: s.title, platform: s.platform, hook: s.hook, body: s.body, tone: s.tone })),
    };
  }
}

export const marketingService = new MarketingService();
