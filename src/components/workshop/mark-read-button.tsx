"use client";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/actions/notifications";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={async () => { await markNotificationRead(id); router.refresh(); }}>
      Mark read
    </button>
  );
}
