import "server-only";
import { db } from "@/lib/db";

/** The demo rider — Ahmad Danial. The Rider app renders as this customer (§49). */
export async function getDemoCustomer() {
  const customer = await db.customer.findFirst({
    where: { phone: "012-345 6789" },
    include: { motorcycles: true, authProfile: true },
  });
  return customer;
}
