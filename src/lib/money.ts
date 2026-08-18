// Money is ALWAYS integer sen. RM165.00 = 16500 sen.
// Never use floating-point arithmetic for money (see §102).

export const toSen = (rm: number): number => Math.round(rm * 100);

/** "RM4,850" — no decimals when the amount is whole, else 2 decimals ("RM165.50"). */
export function formatRM(sen: number): string {
  const negative = sen < 0;
  const abs = Math.abs(sen);
  const whole = Math.floor(abs / 100);
  const cents = abs % 100;
  const body =
    cents === 0
      ? whole.toLocaleString("en-MY")
      : (whole + cents / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (negative ? "-RM" : "RM") + body;
}

/** §69: Gross Profit = Revenue − COGS */
export function grossProfit(revenueSen: number, cogsSen: number): number {
  return revenueSen - cogsSen;
}

/** §38: Gross Margin = GP / Revenue × 100 */
export function grossMargin(grossProfitSen: number, revenueSen: number): number {
  if (revenueSen <= 0) return 0;
  return (grossProfitSen / revenueSen) * 100;
}
