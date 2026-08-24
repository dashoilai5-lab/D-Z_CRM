"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/** Profile 页右上角登出按钮。 */
export function SignOutIconButton({ title = "Sign out" }: { title?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const { signOutSupabase } = await import("@/actions/auth-supabase");
        await signOutSupabase();
        router.push("/rider/login");
        router.refresh();
      }}
      title={title}
      aria-label={title}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
