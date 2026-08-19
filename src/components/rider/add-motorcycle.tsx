"use client";

import { MotorcycleForm } from "@/components/rider/motorcycle-form";

/** Thin wrapper: create-mode motorcycle form. */
export function AddMotorcycle({ customerId, onDone }: { customerId: string; onDone: () => void }) {
  return <MotorcycleForm customerId={customerId} onDone={onDone} submitLabel="ADD MOTORCYCLE" />;
}
