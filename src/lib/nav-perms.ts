import "server-only";
import { db } from "@/lib/db";
import { NAV_SECTIONS, personaSees, moduleAllowed, type WorkshopPersona } from "@/lib/nav-registry";

/** 可传给 client 的导航项（剥离 icon/access 组件引用——server→client 不允许函数）。 */
export interface NavChildData {
  key: string;
  label: string;
  labelKey?: string;
  href: string;
}
export interface NavSectionData {
  section: string | null;
  items: NavChildData[];
}

/**
 * 角色导航（DB Permission 覆盖感知）：Permission 行优先于默认矩阵。
 * Developer Settings 关闭某角色×模块 → 导航即时隐藏。
 */
export async function navForRoleWithPerms(orgId: string, role: string, persona: WorkshopPersona): Promise<NavSectionData[]> {
  const perms = await db.permission.findMany({ where: { organisationId: orgId }, select: { roleName: true, module: true, canView: true } });
  const byKey = new Map(perms.map((p) => [p.roleName + "|" + p.module, p.canView]));
  const allowed = (module: string): boolean => {
    const key = role + "|" + module;
    const row = byKey.get(key);
    if (row !== undefined) return row;
    return moduleAllowed(role, module);
  };
  return NAV_SECTIONS.map((g) => ({
    section: g.section,
    items: g.items
      .filter((i) => {
        if (!personaSees(persona, i.access)) return false;
        if (!i.module) return true; // 未标注 module → persona 过滤已够
        return allowed(i.module);
      })
      .map((i) => ({ key: i.key, label: i.label, labelKey: i.labelKey, href: i.href })),
  })).filter((g) => g.items.length > 0);
}

/** 当前 pathname 对应的 nav 项（用于 URL 级模块守卫）。 */
export function navItemForPath(pathname: string): { module?: string; href: string } | undefined {
  return NAV_SECTIONS.flatMap((g) => g.items).find((i) => i.href && (pathname === i.href || pathname.startsWith(i.href + "/")));
}
