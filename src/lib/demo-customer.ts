import "server-only";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * 当前 rider 顾客（带车辆/认证档案）。
 * 生产：Supabase session → Customer.authId；
 * 非生产：demo 顾客（Ahmad Danial，e2e/本地）。
 */
export async function getDemoCustomer() {
  if (process.env.NODE_ENV === "production") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return db.customer.findUnique({
      where: { authId: user.id },
      include: { motorcycles: true, authProfile: true },
    });
  }
  const customer = await db.customer.findFirst({
    where: { phone: "012-345 6789" },
    include: { motorcycles: true, authProfile: true },
  });
  return customer;
}
