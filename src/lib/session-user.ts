import "server-only";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getPersona } from "@/lib/demo";
import { getDemoUser, type DemoUserInfo } from "@/lib/demo-user";
import { getDemoCustomer } from "@/lib/demo-customer";
import type { User, Customer } from "@prisma/client";

export interface SessionUser {
  kind: "staff" | "customer" | "demo-staff" | "demo-customer" | "none";
  /** 当前业务用户（staff 或 customer 记录） */
  user: User | Customer | null;
  demoUser?: DemoUserInfo | null;
  demoCustomer?: Customer | null;
  role: string;
  name: string;
  initials: string;
  orgId: string;
  branchId: string | null;
  /** 生产模式（Supabase 认证） */
  authenticated: boolean;
}

const isProd = process.env.NODE_ENV === "production";

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * 统一当前用户解析。
 * 生产：Supabase session → User.authId/Customer.authId 查业务记录；
 * 非生产：demo persona（保留 e2e/本地行为）。
 */
export async function getSessionUser(): Promise<SessionUser> {
  if (!isProd) {
    // demo 模式（本地 / e2e）
    const persona = await getPersona();
    const demoUser = await getDemoUser(persona);
    const demoCustomer = persona === "CUSTOMER" ? await getDemoCustomer() : null;
    if (demoUser) {
      return { kind: "demo-staff", user: null, demoUser, demoCustomer: null, role: demoUser.roleLabel, name: demoUser.name, initials: demoUser.initials, orgId: "", branchId: null, authenticated: false };
    }
    if (demoCustomer) {
      return { kind: "demo-customer", user: demoCustomer, demoUser: null, demoCustomer, role: "CUSTOMER", name: demoCustomer.name, initials: initialsOf(demoCustomer.name), orgId: demoCustomer.organisationId, branchId: demoCustomer.branchId, authenticated: false };
    }
    return { kind: "none", user: null, demoUser: null, demoCustomer: null, role: "", name: "", initials: "", orgId: "", branchId: null, authenticated: false };
  }

  // 生产：Supabase session
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { kind: "none", user: null, demoUser: null, demoCustomer: null, role: "", name: "", initials: "", orgId: "", branchId: null, authenticated: false };

  // 员工
  const staff = await db.user.findUnique({ where: { authId: authUser.id } });
  if (staff) {
    return { kind: "staff", user: staff, demoUser: null, demoCustomer: null, role: staff.role, name: staff.name, initials: initialsOf(staff.name), orgId: staff.organisationId, branchId: staff.branchId, authenticated: true };
  }
  // rider 顾客
  const rider = await db.customer.findUnique({ where: { authId: authUser.id } });
  if (rider) {
    return { kind: "customer", user: rider, demoUser: null, demoCustomer: null, role: "CUSTOMER", name: rider.name, initials: initialsOf(rider.name), orgId: rider.organisationId, branchId: rider.branchId, authenticated: true };
  }
  // 已登录但未关联业务账号
  return { kind: "none", user: null, demoUser: null, demoCustomer: null, role: "", name: "", initials: "", orgId: "", branchId: null, authenticated: true };
}

/** Role → 最近 persona 映射（nav-registry 按 persona 过滤导航）。 */
export function personaForRole(role: string): string {
  if (["SUPER_ADMIN", "OWNER", "HEAD_OFFICE_ADMIN", "MANAGER", "PARTS_MANAGER", "INVENTORY", "MARKETING", "ACCOUNTING", "AUDITOR"].includes(role)) return "OWNER";
  if (["COUNTER_STAFF", "SALES_MANAGER", "SALES_ADVISOR", "CUSTOMER_SERVICE"].includes(role)) return "COUNTER_STAFF";
  if (["MECHANIC", "SERVICE_MANAGER", "SERVICE_ADVISOR"].includes(role)) return "MECHANIC";
  return "OWNER";
}

/** DemoBar 是否显示：生产隐藏（除非 NEXT_PUBLIC_DEMO_MODE=true）。 */
export function demoBarVisible(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return !isProd;
}
