import type { SVGProps } from "react";
import { Wrench, Bike, HardHat } from "lucide-react";

export type DZApp = "workshop" | "rider" | "mechanic";

/**
 * 三端专属品牌 logo 图标：
 * - Workshop OS → Wrench（门店工坊）
 * - Rider      → Bike（骑车人）
 * - Mechanic   → HardHat（技师）
 * 用于各端品牌 logo 位（登录页/侧边栏/header/入口卡），一眼区分三端。
 */
export function AppBrandIcon({ app, className = "", ...props }: { app: DZApp } & SVGProps<SVGSVGElement>) {
  if (app === "rider") return <Bike className={className} {...props} />;
  if (app === "mechanic") return <HardHat className={className} {...props} />;
  return <Wrench className={className} {...props} />;
}
