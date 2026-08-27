import { redirect } from "next/navigation";
import { getRiderCustomer } from "@/lib/rider-customer";
import { BikeFirstPrompt } from "@/components/rider/bike-first-prompt";
import { PageTransition } from "@/components/shared/page-transition";

export const dynamic = "force-dynamic";

/** 首辆摩托引导页：登录后无摩托（未跳过）跳这里注册第一辆。已有摩托 → 首页。 */
export default async function BikeFirstPage() {
  const customer = await getRiderCustomer();
  if (!customer) redirect("/rider/login");
  if (customer.motorcycles.length > 0) redirect("/rider/home");
  return (
    <PageTransition>
      <BikeFirstPrompt customerId={customer.id} />
    </PageTransition>
  );
}
