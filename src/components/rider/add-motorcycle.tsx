"use client";

import { MotorcycleForm } from "@/components/rider/motorcycle-form";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** Thin wrapper: create-mode motorcycle form. */
export function AddMotorcycle({ customerId, onDone }: { customerId: string; onDone: () => void }) {
  const lang = useLang();
  return <MotorcycleForm customerId={customerId} onDone={onDone} submitLabel={t("bike.add", lang)} />;
}
