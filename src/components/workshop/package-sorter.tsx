"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

export function PackageSorter() {
  const [mode, setMode] = useState("price");

  function sort(m: string) {
    setMode(m);
    const grid = document.getElementById("package-grid");
    if (!grid) return;
    const cards = Array.from(grid.children) as HTMLElement[];
    const order = { GOOD: 0, BETTER: 1, BEST: 2 };
    cards.sort((a, b) => {
      const priceA = parseInt(a.dataset.price ?? "0");
      const priceB = parseInt(b.dataset.price ?? "0");
      const tierA = order[(a.dataset.tier ?? "GOOD") as keyof typeof order] ?? 0;
      const tierB = order[(b.dataset.tier ?? "GOOD") as keyof typeof order] ?? 0;
      return m === "price" ? priceA - priceB : tierA - tierB;
    });
    cards.forEach((c) => grid.appendChild(c));
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      <button className={mode === "price" ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"} onClick={() => sort("price")}>Price</button>
      <span className="text-muted-foreground/40">·</span>
      <button className={mode === "tier" ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"} onClick={() => sort("tier")}>Tier</button>
    </span>
  );
}
