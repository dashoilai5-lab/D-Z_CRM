"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { sendReminder } from "@/actions/workshop";

export function ReminderRowActions({ customerId, motorcycleId, nextServiceMileage }: { customerId: string; motorcycleId: string; nextServiceMileage: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending}
      onClick={() => start(async () => { await sendReminder(customerId, motorcycleId, nextServiceMileage); router.refresh(); toast.success("WhatsApp reminder sent (mock)"); })}>
      <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message
    </Button>
  );
}
