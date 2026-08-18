import { formatRM } from "@/lib/money";

export function Money({ sen, className, bold = false }: { sen: number; className?: string; bold?: boolean }) {
  return <span className={className + (bold ? " font-semibold tabular-nums" : " tabular-nums")}>{formatRM(sen)}</span>;
}
