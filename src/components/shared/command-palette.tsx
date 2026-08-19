"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Bike, Wrench, Package, CornerDownLeft, Loader2 } from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

interface Hit {
  type: "customer" | "motorcycle" | "job" | "product";
  label: string;
  sub: string;
  href: string;
}

/** Ctrl/Cmd+K global search (§18): customer, phone, plate, motorcycle, job, product, SKU. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      const id = requestAnimationFrame(() => { setHits([]); setLoading(false); });
      return () => cancelAnimationFrame(id);
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q));
        const data = (await res.json()) as { hits: Hit[] };
        setHits(data.hits);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q]);

  const icon = (t: Hit["type"]) =>
    t === "customer" ? <User className="h-4 w-4" /> :
    t === "motorcycle" ? <Bike className="h-4 w-4" /> :
    t === "job" ? <Wrench className="h-4 w-4" /> : <Package className="h-4 w-4" />;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left text-xs">Search customers, bikes, jobs, parts…</span>
        <kbd className="pointer-events-none rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search name, phone, plate, job no, SKU…" value={q} onValueChange={setQ} />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </div>
            )}
            {!loading && q.trim() !== "" && hits.length === 0 && <CommandEmpty>No results for “{q}”.</CommandEmpty>}
            {!loading && hits.length > 0 && (
              <>
                <CommandGroup heading="Results">
                  {hits.map((h, i) => (
                    <CommandItem
                      key={h.type + i}
                      value={h.label + " " + h.sub}
                      onSelect={() => { setOpen(false); router.push(h.href); }}
                    >
                      {icon(h.type)}
                      <div className="flex-1">
                        <div className="text-sm">{h.label}</div>
                        <div className="text-xs text-muted-foreground">{h.sub}</div>
                      </div>
                      <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
