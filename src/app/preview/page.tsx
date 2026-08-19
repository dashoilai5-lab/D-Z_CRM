"use client";

import { useEffect, useMemo, useState } from "react";
import { Smartphone, RotateCcw, ExternalLink, ChevronLeft, ChevronRight, Home, Bike, CalendarPlus, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

// pages navigable in the phone frame (mirror of rider routes)
const PAGES = [
  { href: "/rider/home", label: "Home", icon: Home },
  { href: "/rider/motorcycles", label: "My Bike", icon: Bike },
  { href: "/rider/book", label: "Book", icon: CalendarPlus },
  { href: "/rider/bookings", label: "Bookings" },
  { href: "/rider/service-history", label: "History", icon: History },
  { href: "/rider/invoices", label: "Invoices" },
  { href: "/rider/notifications", label: "Notifications" },
  { href: "/rider/promotions", label: "Offers" },
  { href: "/rider/profile", label: "Profile", icon: User },
] as const;

// device presets (CSS width of the phone body; height auto-scales by aspect)
const DEVICES = [
  { id: "iphone", label: "iPhone 15", w: 393, h: 852, notch: "dynamic-island" },
  { id: "pixel", label: "Pixel 7", w: 412, h: 915, notch: "punch-hole" },
  { id: "compact", label: "Compact", w: 360, h: 780, notch: "none" },
] as const;

export default function PreviewPage() {
  const [page, setPage] = useState<string>("/rider/home");
  const [device, setDevice] = useState<(typeof DEVICES)[number]>(DEVICES[0]);
  const [lang, setLang] = useState<"en" | "zh" | "ms">("en");
  const [frameKey, setFrameKey] = useState(0); // bump to reload iframe
  const [persona, setPersona] = useState<"CUSTOMER" | "OWNER">("CUSTOMER");

  const src = useMemo(() => page, [page]);

  // apply cookies for the iframe (same-origin) so the rider app renders the right persona + lang
  useEffect(() => {
    document.cookie = "dz_demo_persona=" + persona + "; path=/";
    document.cookie = "dz_lang=" + lang + "; path=/";
    setFrameKey((k) => k + 1); // reload frame with new cookies
  }, [persona, lang]);

  const curIdx = PAGES.findIndex((p) => p.href === page);
  const go = (dir: 1 | -1) => {
    const next = (curIdx + dir + PAGES.length) % PAGES.length;
    setPage(PAGES[next].href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center px-4 py-6">
      {/* header */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center"><Smartphone className="h-4 w-4" /></div>
          <div>
            <div className="font-bold text-sm">D&Z Rider — Phone Preview</div>
            <div className="text-[11px] text-white/50">Device frame · live app · debug view</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* persona */}
          <select value={persona} onChange={(e) => setPersona(e.target.value as "CUSTOMER" | "OWNER")} className="h-8 rounded-lg bg-white/10 border border-white/15 px-2 text-xs text-white outline-none">
            <option value="CUSTOMER">Customer (Ahmad)</option>
            <option value="OWNER">Owner (workshop)</option>
          </select>
          {/* lang */}
          <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "zh" | "ms")} className="h-8 rounded-lg bg-white/10 border border-white/15 px-2 text-xs text-white outline-none">
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ms">Bahasa</option>
          </select>
          {/* device */}
          <select value={device.id} onChange={(e) => setDevice(DEVICES.find((d) => d.id === e.target.value) ?? DEVICES[0])} className="h-8 rounded-lg bg-white/10 border border-white/15 px-2 text-xs text-white outline-none">
            {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.label} · {d.w}px</option>)}
          </select>
          <button onClick={() => setFrameKey((k) => k + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15 hover:bg-white/20" title="Reload frame"><RotateCcw className="h-3.5 w-3.5" /></button>
          <a href={src} target="_blank" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15 hover:bg-white/20" title="Open in new tab"><ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>

      {/* page nav */}
      <div className="w-full max-w-5xl flex items-center gap-2 mb-6 flex-wrap justify-center">
        <button onClick={() => go(-1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex flex-wrap gap-1.5">
          {PAGES.map((p) => (
            <button key={p.href} onClick={() => setPage(p.href)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", page === p.href ? "bg-emerald-500 text-white" : "bg-white/10 hover:bg-white/20")}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => go(1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {/* phone frame */}
      <div className="relative" style={{ width: device.w + 24 }}>
        {/* outer bezel */}
        <div className="rounded-[3rem] border-[10px] border-slate-700 bg-slate-800 shadow-2xl overflow-hidden" style={{ height: device.h + 4 }}>
          {/* dynamic island / punch hole */}
          {device.notch === "dynamic-island" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 z-20 h-6 w-24 rounded-full bg-black" />
          )}
          {device.notch === "punch-hole" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-3 z-20 h-4 w-4 rounded-full bg-black" />
          )}
          {/* screen */}
          <iframe
            key={frameKey}
            src={src}
            title="Rider app preview"
            className="w-full bg-white"
            style={{ height: device.h }}
          />
        </div>
        {/* side buttons */}
        <div className="absolute -left-3 top-24 h-12 w-1.5 rounded-full bg-slate-700" />
        <div className="absolute -left-3 top-40 h-12 w-1.5 rounded-full bg-slate-700" />
        <div className="absolute -right-3 top-28 h-16 w-1.5 rounded-full bg-slate-700" />
      </div>

      {/* hint */}
      <p className="mt-6 text-[11px] text-white/40 max-w-md text-center">
        The frame embeds the live rider app (same origin, cookies shared). Switch page / device / persona / language to inspect each state.
        The amber demo bar inside the frame is part of the prototype.
      </p>
    </div>
  );
}
