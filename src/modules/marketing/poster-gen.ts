// Poster generation — programmatic SVG poster builder (prototype of an AI poster
// service). Marketing uploads a reference asset + requirements; we compose a
// branded poster from templates, tones, promo info and the reference image.
import { storageProvider } from "@/providers";
import { db } from "@/lib/db";

export type PosterSize = "SQUARE" | "STORY" | "BANNER";
export type PosterTone = "brand" | "deep" | "fresh" | "bold";
export type PosterVisual = "poster" | "photo";

export interface PosterInput {
  title: string;
  subtitle?: string;
  promo?: string;
  tone?: PosterTone;
  size?: PosterSize;
  visual?: PosterVisual; // poster = graphic layout · photo = photographic-style scene
  assetUrl?: string;
  count?: number; // batch: generate N variants
}

const SIZES: Record<PosterSize, { w: number; h: number; label: string }> = {
  SQUARE: { w: 1080, h: 1080, label: "1:1 Instagram" },
  STORY: { w: 1080, h: 1920, label: "9:16 Story" },
  BANNER: { w: 1920, h: 1080, label: "16:9 Banner" },
};

const TONES: Record<PosterTone, { from: string; to: string; accent: string; title: string }> = {
  brand: { from: "#1e2a4a", to: "#e2571a", accent: "#ffb02e", title: "#ffffff" },
  deep: { from: "#0f1e3d", to: "#123a5e", accent: "#38bdf8", title: "#ffffff" },
  fresh: { from: "#0f3d2e", to: "#146356", accent: "#4ade80", title: "#ffffff" },
  bold: { from: "#3d0f1e", to: "#7a1f2b", accent: "#fb7185", title: "#ffffff" },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Compose a branded SVG poster. */
export function buildPosterSvg(input: PosterInput): string {
  const tone = TONES[input.tone ?? "brand"];
  const size = SIZES[input.size ?? "SQUARE"];
  const w = size.w;
  const h = size.h;
  const title = esc(input.title || "D&Z PROMOTION");
  const subtitle = esc(input.subtitle ?? "");
  const promo = esc(input.promo ?? "");
  const titleSize = Math.max(48, Math.round(w / 14));
  const titleY = Math.round(h * (input.size === "STORY" ? 0.62 : 0.5));
  const asset = input.assetUrl ? esc(input.assetUrl) : null;
  const assetR = Math.round(Math.min(w, h) * 0.16);

  const isPhoto = (input.visual ?? "poster") === "photo";
  let s = "";
  s += '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">';
  s += "<defs>";
  s += '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + tone.from + '"/><stop offset="1" stop-color="' + tone.to + '"/></linearGradient>';
  s += '<radialGradient id="glow" cx="0.8" cy="0.15" r="0.7"><stop offset="0" stop-color="' + tone.accent + '" stop-opacity="0.35"/><stop offset="1" stop-color="' + tone.accent + '" stop-opacity="0"/></radialGradient>';
  s += "</defs>";
  s += '<rect width="' + w + '" height="' + h + '" fill="url(#bg)"/>';
  s += '<rect width="' + w + '" height="' + h + '" fill="url(#glow)"/>';
  s += '<circle cx="' + Math.round(w * 0.92) + '" cy="' + Math.round(h * 0.1) + '" r="' + Math.round(Math.min(w, h) * 0.22) + '" fill="none" stroke="' + tone.accent + '" stroke-opacity="0.25" stroke-width="' + Math.round(w / 90) + '"/>';
  s += '<polygon points="0,' + Math.round(h * 0.94) + " " + Math.round(w * 0.28) + "," + h + ' 0,' + h + '" fill="' + tone.accent + '" fill-opacity="0.12"/>';
  s += '<polygon points="' + Math.round(w * 0.86) + "," + h + " " + w + "," + Math.round(h * 0.82) + " " + w + "," + h + '" fill="' + tone.accent + '" fill-opacity="0.10"/>';
  s += '<text x="' + Math.round(w * 0.07) + '" y="' + Math.round(h * 0.11) + '" font-family="Arial, sans-serif" font-size="' + Math.round(w / 28) + '" font-weight="800" letter-spacing="4" fill="' + tone.accent + '">D&amp;Z SMART WORKSHOP</text>';
  if (isPhoto) {
    // photographic-style scene: gradient sky + sun glow + motorcycle silhouette + vignette
    s += '<circle cx="' + Math.round(w * 0.7) + '" cy="' + Math.round(h * 0.25) + '" r="' + Math.round(Math.min(w, h) * 0.18) + '" fill="' + tone.accent + '" opacity="0.55"/>';
    s += '<ellipse cx="' + Math.round(w * 0.5) + '" cy="' + Math.round(h * 0.82) + '" rx="' + Math.round(w * 0.75) + '" ry="' + Math.round(h * 0.08) + '" fill="#000" opacity="0.35"/>';
    // simple motorcycle silhouette (wheels + body)
    s += '<circle cx="' + Math.round(w * 0.34) + '" cy="' + Math.round(h * 0.72) + '" r="' + Math.round(h * 0.09) + '" fill="none" stroke="#0b0e1a" stroke-width="' + Math.round(h * 0.02) + '"/>';
    s += '<circle cx="' + Math.round(w * 0.66) + '" cy="' + Math.round(h * 0.72) + '" r="' + Math.round(h * 0.09) + '" fill="none" stroke="#0b0e1a" stroke-width="' + Math.round(h * 0.02) + '"/>';
    s += '<path d="M ' + Math.round(w * 0.34) + ' ' + Math.round(h * 0.72) + ' L ' + Math.round(w * 0.42) + ' ' + Math.round(h * 0.58) + ' L ' + Math.round(w * 0.62) + ' ' + Math.round(h * 0.58) + ' L ' + Math.round(w * 0.66) + ' ' + Math.round(h * 0.72) + '" fill="none" stroke="#0b0e1a" stroke-width="' + Math.round(h * 0.028) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<rect x="' + Math.round(w * 0.05) + '" y="' + Math.round(h * 0.05) + '" width="' + Math.round(w * 0.9) + '" height="' + Math.round(h * 0.9) + '" fill="none" stroke="' + tone.accent + '" stroke-opacity="0.18" stroke-width="' + Math.round(w / 300) + '"/>';
  }
  if (asset) {
    s += '<circle cx="' + Math.round(w * 0.85) + '" cy="' + Math.round(h * 0.2) + '" r="' + assetR + '" fill="' + tone.accent + '" fill-opacity="0.15"/>';
    s += '<clipPath id="assetClip"><circle cx="' + Math.round(w * 0.85) + '" cy="' + Math.round(h * 0.2) + '" r="' + (assetR - 6) + '"/></clipPath>';
    s += '<image href="' + asset + '" x="' + (Math.round(w * 0.85) - (assetR - 6)) + '" y="' + (Math.round(h * 0.2) - (assetR - 6)) + '" width="' + (assetR - 6) * 2 + '" height="' + (assetR - 6) * 2 + '" clip-path="url(#assetClip)" preserveAspectRatio="xMidYMid slice"/>';
  }
  if (promo) {
    s += '<rect x="' + Math.round(w * 0.07) + '" y="' + Math.round(h * 0.24) + '" width="' + Math.round(w * 0.52) + '" height="' + Math.round(h * 0.085) + '" rx="' + Math.round(h * 0.04) + '" fill="' + tone.accent + '"/>';
    s += '<text x="' + Math.round(w * 0.09) + '" y="' + Math.round(h * 0.31) + '" font-family="Arial, sans-serif" font-size="' + Math.round(w / 34) + '" font-weight="700" fill="#10131f">' + promo + "</text>";
  }
  s += '<text x="' + Math.round(w * 0.07) + '" y="' + titleY + '" font-family="Arial, sans-serif" font-size="' + titleSize + '" font-weight="900" fill="' + tone.title + '">' + title + "</text>";
  if (subtitle) {
    s += '<text x="' + Math.round(w * 0.07) + '" y="' + Math.round(titleY + titleSize * 1.1) + '" font-family="Arial, sans-serif" font-size="' + Math.round(titleSize * 0.45) + '" font-weight="500" fill="' + tone.title + '" fill-opacity="0.85">' + subtitle + "</text>";
  }
  s += '<text x="' + Math.round(w * 0.07) + '" y="' + Math.round(h * 0.92) + '" font-family="Arial, sans-serif" font-size="' + Math.round(w / 40) + '" fill="' + tone.title + '" fill-opacity="0.7">D&amp;Z Smart Workshop · WhatsApp 011-123 4567 · Walk-in welcome</text>';
  s += "</svg>";
  return s;
}

/** Generate poster(s): compose SVG(s), persist to storage, record MarketingAsset(s). */
export async function generatePoster(input: PosterInput & { branchId: string }) {
  const count = Math.min(Math.max(input.count ?? 1, 1), 4);
  const base = input.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 20) || "poster";
  const results = [];
  for (let i = 0; i < count; i++) {
    const variantTitle = count > 1 ? input.title + " #" + (i + 1) : input.title;
    const tone = (["brand", "deep", "fresh", "bold"] as const)[i % 4];
    const svg = buildPosterSvg({ ...input, title: variantTitle, tone: input.tone ?? tone });
    const key = "posters/" + Date.now() + "-" + base + "-" + i + ".svg";
    const url = await storageProvider.put(key, new TextEncoder().encode(svg), "image/svg+xml");
    const asset = await db.marketingAsset.create({
      data: {
        branchId: input.branchId,
        title: variantTitle,
        type: input.visual === "photo" ? "PHOTO" : "POSTER",
        month: new Date().toISOString().slice(0, 7),
        description: "AI-generated · " + (input.size ?? "SQUARE") + " · " + (input.tone ?? tone) + (input.visual === "photo" ? " · photo" : ""),
        url,
      },
    });
    results.push({ asset, url });
  }
  return results;
}
