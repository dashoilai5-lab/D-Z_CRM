"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Wrench, ArrowRight } from "lucide-react";
import { setPersona } from "@/actions/demo";

export function WorkshopOSEntry({ persona }: { persona: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (persona === "CUSTOMER") {
    // CUSTOMER has no workshop access — switching identity on click lets them straight in
    return (
      <button
        onClick={() => start(async () => { await setPersona("OWNER"); router.push("/workshop/dashboard"); router.refresh(); })}
        className="group rounded-3xl border bg-card p-7 hover:border-primary/50 transition-colors text-left w-full"
      >
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Wrench className="h-6 w-6" /></div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-xl font-semibold mt-5">D&Z Workshop OS</h3>
        <p className="text-sm text-muted-foreground mt-1">You are viewing as Customer — click to switch to Workshop Owner and enter.</p>
        <div className="mt-4 text-sm font-medium text-primary">{pending ? "Switching…" : "Enter Workshop OS (switch to Owner) →"}</div>
      </button>
    );
  }
  return (
    <Link href="/workshop/dashboard" className="group rounded-3xl border bg-card p-7 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Wrench className="h-6 w-6" /></div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-xl font-semibold mt-5">D&Z Workshop OS</h3>
      <p className="text-sm text-muted-foreground mt-1">Operate, manage and grow the workshop — jobs, customers, inventory, profit, staff.</p>
      <div className="mt-4 text-sm font-medium text-primary">Enter Workshop OS →</div>
    </Link>
  );
}
