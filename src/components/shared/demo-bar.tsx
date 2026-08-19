"use client";

import { useTransition } from "react";
import { RefreshCcw, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { setPersona, resetDemo } from "@/actions/demo";
import { ThemeControls } from "@/components/shared/theme-controls";
import { DEMO_PERSONAS, PERSONA_LABEL, type DemoPersona } from "@/lib/persona";

export function DemoBar({ persona, compact = false }: { persona: DemoPersona; compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="sticky top-0 z-40 border-b bg-amber-50/90 backdrop-blur print:hidden dark:bg-amber-950/70 dark:border-amber-900/40">
      <div className={`mx-auto flex items-center gap-2 px-3 md:px-6 ${compact ? "h-10" : "h-11"}`}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/30">
          <FlaskConical className="h-3 w-3" /> DEMO MODE
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">DEMO AS</span>
        <Select
          value={persona}
          onValueChange={(v) => startTransition(async () => { await setPersona(v as DemoPersona); router.refresh(); toast.success("Switched to " + PERSONA_LABEL[v as DemoPersona]); })}
        >
          <SelectTrigger className="h-7 w-[150px] md:w-[190px] text-xs bg-white dark:bg-background" disabled={pending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEMO_PERSONAS.map((p) => (
              <SelectItem key={p} value={p}>{PERSONA_LABEL[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <ThemeControls compact />
        <AlertDialog>
          <AlertDialogTrigger data-testid="reset-demo" className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-white px-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 dark:bg-background">
            <RefreshCcw className="h-3 w-3" /> RESET DEMO DATA
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
              <AlertDialogDescription>
                This wipes the local database and reseeds it. Every shared record — jobs, customers, inventory, profit, rider app — returns to the original demo state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={async () => {
                  const r = await resetDemo();
                  router.refresh();
                  toast.success("Demo data reset — " + Object.values(r.counts).reduce((a, b) => a + b, 0) + " records reseeded");
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
