// Lightweight i18n — English / 中文 / Bahasa Malaysia.
// Dictionary is keyed by a stable string; components look up via t(key, lang).
// The active language lives in a cookie (dz_lang) so server components can read it.

export type Lang = "en" | "zh" | "ms";
export const LANGS: Lang[] = ["en", "zh", "ms"];
export const LANG_COOKIE = "dz_lang";
export const LANG_LABEL: Record<Lang, string> = { en: "EN", zh: "中文", ms: "BM" };

export type Dict = Record<string, { en: string; zh: string; ms: string }>;

export const DICT: Dict = {
  // --- sidebar navigation ---
  "nav.dashboard": { en: "Dashboard", zh: "仪表盘", ms: "Papan Pemuka" },
  "nav.customers": { en: "Customers", zh: "客户", ms: "Pelanggan" },
  "nav.return-list": { en: "Customer Return List", zh: "客户回流名单", ms: "Senarai Pulangan Pelanggan" },
  "nav.reminders": { en: "Service Reminders", zh: "保养提醒", ms: "Peringatan Servis" },
  "nav.bookings": { en: "Bookings", zh: "预约", ms: "Tempahan" },
  "nav.jobs": { en: "Service Jobs", zh: "工单", ms: "Kerja Servis" },
  "nav.mechanic": { en: "Mechanic Board", zh: "机械师看板", ms: "Papan Mekanik" },
  "nav.checklists": { en: "Checklists", zh: "检查清单", ms: "Senarai Semak" },
  "nav.packages": { en: "Service Packages", zh: "服务套餐", ms: "Pakej Servis" },
  "nav.calendar": { en: "Promotion Calendar", zh: "促销日历", ms: "Kalendar Promosi" },
  "nav.posters": { en: "Poster Library", zh: "海报库", ms: "Perpustakaan Poster" },
  "nav.scripts": { en: "Reels Script Bank", zh: "脚本库", ms: "Bank Skrip" },
  "nav.reviews": { en: "Reviews", zh: "评价", ms: "Ulasan" },
  "nav.staff": { en: "Staff", zh: "员工", ms: "Staf" },
  "nav.kpi": { en: "KPI Board", zh: "KPI 看板", ms: "Papan KPI" },
  "nav.products": { en: "Products", zh: "产品", ms: "Produk" },
  "nav.stock": { en: "Stock", zh: "库存", ms: "Stok" },
  "nav.alerts": { en: "Stock Alerts", zh: "库存预警", ms: "Amaran Stok" },
  "nav.dead-stock": { en: "Dead Stock", zh: "滞销库存", ms: "Stok Mati" },
  "nav.reorder": { en: "Reorder", zh: "补货", ms: "Pesanan Semula" },
  "nav.purchase-orders": { en: "Purchase Orders", zh: "采购单", ms: "Pesanan Belian" },
  "nav.suppliers": { en: "Suppliers", zh: "供应商", ms: "Pembekal" },
  "nav.profit": { en: "Profit Dashboard", zh: "利润分析", ms: "Analisis Untung" },
  "nav.ai": { en: "Today's Recommendations", zh: "今日推荐", ms: "Cadangan Hari Ini" },
  "nav.settings": { en: "Settings", zh: "设置", ms: "Tetapan" },

  // --- sections ---
  "sec.customers": { en: "CUSTOMERS", zh: "客户", ms: "PELANGGAN" },
  "sec.workshop": { en: "WORKSHOP", zh: "车间", ms: "BENGKEL" },
  "sec.marketing": { en: "MARKETING", zh: "营销", ms: "PEMASARAN" },
  "sec.staff": { en: "STAFF", zh: "员工", ms: "STAF" },
  "sec.inventory": { en: "INVENTORY", zh: "库存", ms: "INVENTORI" },
  "sec.finance": { en: "FINANCE", zh: "财务", ms: "KEWANGAN" },
  "sec.ai": { en: "AI CENTRE", zh: "AI 中心", ms: "PUSAT AI" },

  // --- demo bar ---
  "demo.mode": { en: "DEMO MODE", zh: "演示模式", ms: "MOD DEMO" },
  "demo.as": { en: "DEMO AS", zh: "演示角色", ms: "DEMO SEBAGAI" },
  "demo.reset": { en: "RESET DEMO DATA", zh: "重置演示数据", ms: "SET SEMULA DATA" },
  "persona.OWNER": { en: "Workshop Owner", zh: "车行老板", ms: "Pemilik Bengkel" },
  "persona.COUNTER_STAFF": { en: "Counter Staff", zh: "前台员工", ms: "Staf Kaunter" },
  "persona.MECHANIC": { en: "Mechanic", zh: "机械师", ms: "Mekanik" },
  "persona.CUSTOMER": { en: "Customer", zh: "客户", ms: "Pelanggan" },

  // --- rider bottom nav ---
  "navr.home": { en: "Home", zh: "首页", ms: "Utama" },
  "navr.my-bike": { en: "My Bike", zh: "我的摩托", ms: "Motosikal Saya" },
  "navr.book": { en: "Book", zh: "预约", ms: "Tempah" },
  "navr.history": { en: "History", zh: "历史", ms: "Sejarah" },
  "navr.profile": { en: "Profile", zh: "我的", ms: "Profil" },
};

export function t(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang];
}

export function parseLang(v: string | undefined): Lang {
  return (LANGS as string[]).includes(v ?? "") ? (v as Lang) : "en";
}
