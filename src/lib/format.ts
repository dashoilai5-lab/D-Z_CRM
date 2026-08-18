import { format, formatDistanceToNow } from "date-fns";

export const fmtDate = (d: Date | string | null | undefined): string =>
  d ? format(new Date(d), "d MMM yyyy") : "—";

export const fmtDateShort = (d: Date | string | null | undefined): string =>
  d ? format(new Date(d), "d MMM") : "—";

export const fmtDateTime = (d: Date | string | null | undefined): string =>
  d ? format(new Date(d), "d MMM yyyy, HH:mm") : "—";

export const fmtTime = (d: Date | string | null | undefined): string =>
  d ? format(new Date(d), "HH:mm") : "—";

export const fmtRelative = (d: Date | string | null | undefined): string =>
  d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : "—";

export const fmtKM = (km: number | null | undefined): string =>
  km == null ? "—" : km.toLocaleString("en-MY") + " km";

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** Local date at midnight, Kuala Lumpur (+08). */
export const todayMidnight = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
