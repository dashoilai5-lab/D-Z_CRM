"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ScriptCopy({ title, hook, body }: { title: string; hook: string | null; body: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = hook ? hook + "\n\n" + body : body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted" title="Copy script">
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
