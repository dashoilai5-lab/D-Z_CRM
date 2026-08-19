import { getDemoCustomer } from "@/lib/demo-customer";
import { fmtKM } from "@/lib/format";
import { motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { MotorcycleList } from "@/components/rider/motorcycle-list";

export const dynamic = "force-dynamic";

export default async function MyMotorcyclesPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bikes = customer.motorcycles.map((m) => ({
    id: m.id, brand: m.brand, model: m.model, year: m.year, plate: m.plate, type: m.type, currentMileage: m.currentMileage,
  }));
  return <MotorcycleList customerId={customer.id} bikes={bikes} />;
}
