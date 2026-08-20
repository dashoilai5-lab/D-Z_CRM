"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton({ expanded }: { expanded: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const { logout } = await import("@/actions/auth");
        await logout();
        router.push("/login");
        router.refresh();
      }}
      title="Sign out"
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {expanded && <span className="truncate">Sign out</span>}
    </button>
  );
}
