import { getDemoCustomer } from "@/lib/demo-customer";
import { BookForm } from "@/components/rider/book-form";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bikes = customer.motorcycles.map((m) => ({ id: m.id, brand: m.brand, model: m.model, plate: m.plate, type: m.type }));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Book a Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick a slot — we'll take it from there.</p>
      </div>
      <BookForm customerId={customer.id} bikes={bikes} />
    </div>
  );
}
