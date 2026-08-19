"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Type, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FontSize = "sm" | "md" | "lg" | "xl";

const FONT_STEPS: FontSize[] = ["sm", "md", "lg", "xl"];

function readFontSize(): FontSize {
  if (typeof window === "undefined") return "md";
  const v = window.document.documentElement.getAttribute("data-font-size") as FontSize | null;
  return v && FONT_STEPS.includes(v) ? v : "md";
}

export function ThemeControls({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [mounted, setMounted] = useState(false);

  // sync from the DOM (persisted) on mount — defer to avoid cascading render
  useEffect(() => {
    const id = requestAnimationFrame(() => { setFontSize(readFontSize()); setMounted(true); });
    return () => cancelAnimationFrame(id);
  }, []);

  const apply = (next: FontSize) => {
    setFontSize(next);
    window.document.documentElement.setAttribute("data-font-size", next);
    try { localStorage.setItem("dz-font-size", next); } catch {}
  };

  const step = (dir: 1 | -1) => {
    const i = FONT_STEPS.indexOf(fontSize);
    const next = FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, i + dir))];
    apply(next);
  };

  if (!mounted) {
    return <div className={cn("flex items-center gap-1", compact ? "h-7" : "h-8")} aria-hidden />;
  }

  const dark = resolvedTheme === "dark";

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border bg-background p-0.5", compact ? "h-7" : "h-8")}>
      <button
        type="button"
        onClick={() => setTheme(dark ? "light" : "dark")}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle dark mode"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
      <span className="h-4 w-px bg-border" />
      <button type="button" onClick={() => step(-1)} title="Smaller text" aria-label="Decrease font size" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground" title="Font size">
        <Type className="h-3 w-3" />
      </span>
      <button type="button" onClick={() => step(1)} title="Larger text" aria-label="Increase font size" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
