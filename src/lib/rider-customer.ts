import "server-only";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * 当前 rider 顾客（带车辆/认证档案）：Supabase session → Customer.authId。
 */
export async function getRiderCustomer() {
  const supabase = await createClient();
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
  } catch {
    return null;
  }
  if (!user) return null;
  return db.customer.findUnique({
    where: { authId: user.id },
    include: { motorcycles: true, authProfile: true },
  });
}
