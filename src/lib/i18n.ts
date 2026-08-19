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

  // --- common buttons & labels ---
  "common.save": { en: "Save", zh: "保存", ms: "Simpan" },
  "common.cancel": { en: "Cancel", zh: "取消", ms: "Batal" },
  "common.add": { en: "Add", zh: "添加", ms: "Tambah" },
  "common.edit": { en: "Edit", zh: "编辑", ms: "Sunting" },
  "common.delete": { en: "Delete", zh: "删除", ms: "Padam" },
  "common.close": { en: "Close", zh: "关闭", ms: "Tutup" },
  "common.search": { en: "Search", zh: "搜索", ms: "Cari" },
  "common.view-all": { en: "View all", zh: "查看全部", ms: "Lihat semua" },
  "common.back": { en: "Back", zh: "返回", ms: "Kembali" },
  "common.submit": { en: "Submit", zh: "提交", ms: "Hantar" },
  "common.confirm": { en: "Confirm", zh: "确认", ms: "Sahkan" },
  "common.status": { en: "Status", zh: "状态", ms: "Status" },
  "common.date": { en: "Date", zh: "日期", ms: "Tarikh" },
  "common.name": { en: "Name", zh: "姓名", ms: "Nama" },
  "common.phone": { en: "Phone", zh: "电话", ms: "Telefon" },
  "common.email": { en: "Email", zh: "邮箱", ms: "E-mel" },
  "common.notes": { en: "Notes", zh: "备注", ms: "Nota" },
  "common.optional": { en: "optional", zh: "选填", ms: "pilihan" },
  "common.no-data": { en: "No data", zh: "暂无数据", ms: "Tiada data" },
  "common.loading": { en: "Loading…", zh: "加载中…", ms: "Memuat…" },
  "common.total": { en: "Total", zh: "合计", ms: "Jumlah" },
  "common.price": { en: "Price", zh: "价格", ms: "Harga" },
  "common.qty": { en: "Qty", zh: "数量", ms: "Kuantiti" },
  "common.today": { en: "Today", zh: "今天", ms: "Hari ini" },
  "common.active": { en: "Active", zh: "进行中", ms: "Aktif" },
  "common.pending": { en: "Pending", zh: "待处理", ms: "Menunggu" },
  "common.completed": { en: "Completed", zh: "已完成", ms: "Selesai" },

  // --- job status ---
  "status.WAITING": { en: "Waiting", zh: "等待中", ms: "Menunggu" },
  "status.IN_PROGRESS": { en: "In Progress", zh: "进行中", ms: "Dalam Proses" },
  "status.AWAITING_APPROVAL": { en: "Awaiting Approval", zh: "待审批", ms: "Menunggu Kelulusan" },
  "status.READY": { en: "Ready", zh: "已完成", ms: "Sedia" },
  "status.COMPLETED": { en: "Completed", zh: "已完成", ms: "Selesai" },
  "status.CANCELLED": { en: "Cancelled", zh: "已取消", ms: "Dibatalkan" },

  // --- booking status ---
  "book.REQUESTED": { en: "Waiting for confirmation", zh: "等待确认", ms: "Menunggu pengesahan" },
  "book.CONFIRMED": { en: "Confirmed", zh: "已确认", ms: "Disahkan" },
  "book.RESCHEDULED": { en: "Rescheduled", zh: "已改期", ms: "Dijadualkan semula" },
  "book.CHECKED_IN": { en: "Checked in", zh: "已检入", ms: "Didaftar masuk" },
  "book.COMPLETED": { en: "Completed", zh: "已完成", ms: "Selesai" },
  "book.CANCELLED": { en: "Cancelled", zh: "已取消", ms: "Dibatalkan" },

  // --- reminder status ---
  "rem.UPCOMING": { en: "Upcoming", zh: "即将到来", ms: "Akan Datang" },
  "rem.DUE_SOON": { en: "Due Soon", zh: "即将到期", ms: "Hampir Tamat" },
  "rem.DUE": { en: "Due", zh: "已到期", ms: "Tamat Tempoh" },
  "rem.OVERDUE": { en: "Overdue", zh: "已逾期", ms: "Terlewat" },
  "rem.BOOKED": { en: "Booked", zh: "已预约", ms: "Ditempah" },

  // --- rider home ---
  "rider.book-service": { en: "BOOK SERVICE", zh: "预约服务", ms: "TEMPAH SERVIS" },
  "rider.passport": { en: "D&Z Rider Passport", zh: "D&Z 车手护照", ms: "Pasport Penunggang D&Z" },
  "rider.passport-desc": { en: "Verified services · history · maintenance", zh: "已验证服务 · 历史 · 保养", ms: "Servis disahkan · sejarah · penyelenggaraan" },
  "rider.current-mileage": { en: "Current Mileage", zh: "当前里程", ms: "Mileage Semasa" },
  "rider.next-service": { en: "Next Service", zh: "下次保养", ms: "Servis Seterusnya" },
  "rider.my-bikes": { en: "My Motorcycles", zh: "我的摩托车", ms: "Motosikal Saya" },
  "rider.add-bike": { en: "Add", zh: "添加", ms: "Tambah" },
  "rider.add-bike-title": { en: "Add a motorcycle", zh: "添加摩托车", ms: "Tambah motosikal" },
  "rider.book-title": { en: "Book a Service", zh: "预约服务", ms: "Tempah Servis" },
  "rider.book-sub": { en: "Pick a slot — we'll take it from there.", zh: "选择时间段——剩下的交给我们。", ms: "Pilih slot — kami uruskan selebihnya." },
  "rider.motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "rider.service-type": { en: "Service Type", zh: "服务类型", ms: "Jenis Servis" },
  "rider.date": { en: "Date", zh: "日期", ms: "Tarikh" },
  "rider.time": { en: "Time", zh: "时间", ms: "Masa" },
  "rider.request-booking": { en: "REQUEST BOOKING", zh: "提交预约", ms: "HANTAR TEMPAHAN" },
  "rider.my-bookings": { en: "My Bookings", zh: "我的预约", ms: "Tempahan Saya" },
  "rider.invoices": { en: "Invoices", zh: "发票", ms: "Invois" },
  "rider.service-history": { en: "Service History", zh: "服务历史", ms: "Sejarah Servis" },
  "rider.lifetime": { en: "Lifetime", zh: "终身累计", ms: "Sepanjang Hayat" },
  "rider.notifications": { en: "Notifications", zh: "通知", ms: "Notifikasi" },
  "rider.mark-all-read": { en: "Mark all read", zh: "全部已读", ms: "Tandai semua dibaca" },
  "rider.offers": { en: "Offers & Materials", zh: "优惠与素材", ms: "Tawaran & Bahan" },
  "rider.rate-service": { en: "Rate this service ★", zh: "评价本次服务 ★", ms: "Nilaikan servis ini ★" },
  "rider.submit-review": { en: "Submit review", zh: "提交评价", ms: "Hantar ulasan" },
  "rider.thanks-review": { en: "Thanks for your review", zh: "感谢您的评价", ms: "Terima kasih atas ulasan" },

  // --- dashboard ---
  "dash.morning": { en: "Good morning", zh: "早上好", ms: "Selamat pagi" },
  "dash.afternoon": { en: "Good afternoon", zh: "下午好", ms: "Selamat tengah hari" },
  "dash.evening": { en: "Good evening", zh: "晚上好", ms: "Selamat petang" },
  "dash.owner-sub": { en: "Here is what is happening at D&Z Smart Workshop (Kuala Lumpur) today.", zh: "这是 D&Z 智能车行（吉隆坡）今日概况。", ms: "Ini ringkasan D&Z Bengkel Pintar (Kuala Lumpur) hari ini." },
  "dash.mechanic-sub": { en: "Here are your assigned jobs and today's tasks.", zh: "这是你被分配的工作和今日任务。", ms: "Ini kerja tugasan dan tugas anda hari ini." },
  "dash.counter-sub": { en: "Here is the front-desk view for today.", zh: "这是今日前台视图。", ms: "Ini pandangan kaunter untuk hari ini." },
  "dash.my-active-jobs": { en: "My Active Jobs", zh: "我的进行中工单", ms: "Kerja Aktif Saya" },
  "dash.my-jobs-today": { en: "My Jobs Today", zh: "我今日的工单", ms: "Kerja Saya Hari Ini" },
  "dash.awaiting-approval": { en: "Awaiting Approval", zh: "待审批", ms: "Menunggu Kelulusan" },
  "dash.ready": { en: "Ready", zh: "已完成", ms: "Sedia" },
  "dash.today-sales": { en: "Today's Sales", zh: "今日销售额", ms: "Jualan Hari Ini" },
  "dash.gross-profit": { en: "Gross Profit", zh: "毛利", ms: "Untung Kasar" },
  "dash.jobs-today": { en: "Jobs Today", zh: "今日工单", ms: "Kerja Hari Ini" },
  "dash.avg-ticket": { en: "Average Ticket", zh: "平均客单价", ms: "Purata Tiket" },
  "dash.customers-due": { en: "Customers Due", zh: "到期客户", ms: "Pelanggan Tamat" },
  "dash.new-bookings": { en: "New Bookings", zh: "新预约", ms: "Tempahan Baharu" },
  "dash.avg-rating": { en: "Average Rating", zh: "平均评分", ms: "Purata Penilaian" },
  "dash.critical-stock": { en: "Critical Stock", zh: "严重缺货", ms: "Stok Kritikal" },
  "dash.dead-stock-value": { en: "Dead Stock Value", zh: "滞销库存价值", ms: "Nilai Stok Mati" },
  "dash.top-performer": { en: "Top Performer", zh: "最佳表现", ms: "Pencapaian Terbaik" },
  "dash.score": { en: "Score", zh: "分数", ms: "Skor" },
  "dash.workshop-status": { en: "Workshop Status", zh: "车间状态", ms: "Status Bengkel" },
  "dash.view-job-board": { en: "View job board", zh: "查看工单看板", ms: "Lihat papan kerja" },
  "dash.ai-centre": { en: "AI Command Centre", zh: "AI 指挥中心", ms: "Pusat Arahan AI" },
  "dash.no-recs": { en: "No recommendations right now — everything is on track.", zh: "暂无推荐——一切正常。", ms: "Tiada cadangan buat masa ini — semuanya berjalan lancar." },
  "dash.today-jobs": { en: "Today's Jobs", zh: "今日工单", ms: "Kerja Hari Ini" },
  "dash.my-today-jobs": { en: "My Today's Jobs", zh: "我今日的工单", ms: "Kerja Saya Hari Ini" },
  "dash.all-jobs": { en: "All jobs", zh: "全部工单", ms: "Semua kerja" },
  "dash.no-jobs-assigned": { en: "No jobs assigned to you today.", zh: "今天没有分配给你的工单。", ms: "Tiada kerja ditugaskan kepada anda hari ini." },
  "dash.no-jobs-created": { en: "No jobs created today.", zh: "今天没有创建工单。", ms: "Tiada kerja dicipta hari ini." },

  // --- workshop inventory: products ---
  "ws.products.title": { en: "Products", zh: "产品", ms: "Produk" },
  "ws.products.subtitle": { en: "{n} products in the catalog", zh: "目录中共 {n} 个产品", ms: "{n} produk dalam katalog" },
  "ws.products.col.name": { en: "Name", zh: "名称", ms: "Nama" },
  "ws.products.col.category": { en: "Category", zh: "类别", ms: "Kategori" },
  "ws.products.col.brand": { en: "Brand", zh: "品牌", ms: "Jenama" },
  "ws.products.col.cost": { en: "Cost", zh: "成本", ms: "Kos" },
  "ws.products.col.sell": { en: "Sell", zh: "售价", ms: "Jual" },
  "ws.products.col.margin": { en: "Margin", zh: "毛利率", ms: "Margin" },

  // --- workshop inventory: stock ---
  "ws.stock.title": { en: "Stock", zh: "库存", ms: "Stok" },
  "ws.stock.subtitle": { en: "Branch: {branch} · quantity vs minimum + sales velocity", zh: "分店：{branch} · 数量与最低库存及销售速度对比", ms: "Cawangan: {branch} · kuantiti vs minimum + kelajuan jualan" },
  "ws.stock.col.product": { en: "Product", zh: "产品", ms: "Produk" },
  "ws.stock.col.qty": { en: "Qty", zh: "数量", ms: "Kuantiti" },
  "ws.stock.col.min": { en: "Min", zh: "最低", ms: "Min" },
  "ws.stock.col.value": { en: "Value", zh: "价值", ms: "Nilai" },
  "ws.stock.col.days-left": { en: "Est. Days Left", zh: "预计剩余天数", ms: "Anggaran Hari" },
  "ws.stock.col.level": { en: "Level", zh: "级别", ms: "Tahap" },
  "ws.stock.level.HEALTHY": { en: "HEALTHY", zh: "健康", ms: "Sihat" },
  "ws.stock.level.LOW": { en: "LOW", zh: "偏低", ms: "Rendah" },
  "ws.stock.level.CRITICAL": { en: "CRITICAL", zh: "严重", ms: "Kritikal" },
  "ws.stock.level.OUT_OF_STOCK": { en: "OUT OF STOCK", zh: "缺货", ms: "Kehabisan Stok" },

  // --- workshop inventory: alerts ---
  "ws.alerts.title": { en: "Stock Alerts", zh: "库存预警", ms: "Amaran Stok" },
  "ws.alerts.subtitle": { en: "Low / critical / out of stock — reorder before you run out", zh: "偏低 / 严重 / 缺货 — 断货前及时补货", ms: "Rendah / kritikal / kehabisan stok — pesan semula sebelum kehabisan" },
  "ws.alerts.min": { en: "/ min", zh: "/ 最低", ms: "/ min" },
  "ws.alerts.empty": { en: "All stock healthy.", zh: "所有库存健康。", ms: "Semua stok sihat." },

  // --- workshop inventory: purchase orders ---
  "ws.po.title": { en: "Purchase Orders", zh: "采购单", ms: "Pesanan Belian" },
  "ws.po.subtitle": { en: "Accepted reorder recommendations become PO drafts", zh: "已接受的补货建议将生成采购单草稿", ms: "Cadangan pesanan semula yang diterima menjadi draf PO" },
  "ws.po.created": { en: "Created", zh: "创建于", ms: "Dicipta" },
  "ws.po.lines": { en: "lines", zh: "行", ms: "baris" },
  "ws.po.status.DRAFT": { en: "DRAFT", zh: "草稿", ms: "Draf" },
  "ws.po.status.SENT": { en: "Sent", zh: "已发送", ms: "Dihantar" },
  "ws.po.status.RECEIVED": { en: "Received", zh: "已收货", ms: "Diterima" },
  "ws.po.status.CANCELLED": { en: "Cancelled", zh: "已取消", ms: "Dibatalkan" },
  "ws.po.empty": { en: "No purchase orders yet.", zh: "暂无采购单。", ms: "Tiada pesanan belian lagi." },

  // --- workshop inventory: suppliers ---
  "ws.suppliers.title": { en: "Suppliers", zh: "供应商", ms: "Pembekal" },
  "ws.suppliers.subtitle": { en: "{n} suppliers", zh: "共 {n} 家供应商", ms: "{n} pembekal" },
  "ws.suppliers.products": { en: "products", zh: "个产品", ms: "produk" },
  "ws.suppliers.lead-time": { en: "days lead time", zh: "天交货期", ms: "hari masa utama" },

  // --- workshop: bookings ---
  "ws.bookings.title": { en: "Bookings", zh: "预约", ms: "Tempahan" },
  "ws.bookings.subtitle": { en: "Rider App requests and counter bookings — one shared calendar.", zh: "车手 App 预约与前台预约——同一个共享日历。", ms: "Permintaan Apl Penunggang dan tempahan kaunter — satu kalendar dikongsi." },
  "ws.bookings.source-rider": { en: "Rider App", zh: "车手 App", ms: "Apl Penunggang" },

  // --- workshop: service jobs ---
  "ws.jobs.title": { en: "Service Jobs", zh: "服务工单", ms: "Kerja Servis" },
  "ws.jobs.summary": { en: "{n} jobs today · {w} waiting · {a} awaiting approval", zh: "今日 {n} 单 · {w} 等待中 · {a} 待审批", ms: "{n} kerja hari ini · {w} menunggu · {a} menunggu kelulusan" },
  "ws.jobs.view-table": { en: "Table", zh: "表格", ms: "Jadual" },
  "ws.jobs.view-kanban": { en: "Kanban", zh: "看板", ms: "Kanban" },
  "ws.jobs.create": { en: "Create Job", zh: "新建工单", ms: "Cipta Kerja" },
  "ws.jobs.all": { en: "All", zh: "全部", ms: "Semua" },
  "ws.jobs.pending-approvals": { en: "{n} approval(s)", zh: "{n} 个待审批", ms: "{n} kelulusan" },
  "ws.jobs.col-job": { en: "Job", zh: "工单", ms: "Kerja" },
  "ws.jobs.col-customer": { en: "Customer", zh: "客户", ms: "Pelanggan" },
  "ws.jobs.col-motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "ws.jobs.col-mileage": { en: "Mileage", zh: "里程", ms: "Mileage" },
  "ws.jobs.col-service": { en: "Service", zh: "服务", ms: "Servis" },
  "ws.jobs.col-mechanic": { en: "Mechanic", zh: "机械师", ms: "Mekanik" },

  // --- workshop: service packages ---
  "ws.packages.title": { en: "Service Packages", zh: "服务套餐", ms: "Pakej Servis" },
  "ws.packages.subtitle": { en: "GOOD · BETTER · BEST — the counter recommendation ladder", zh: "GOOD · BETTER · BEST —— 前台推荐阶梯", ms: "GOOD · BETTER · BEST — tangga cadangan kaunter" },
  "ws.packages.best-value": { en: "BEST VALUE", zh: "超值之选", ms: "NILAI TERBAIK" },

  // --- workshop: customers ---
  "ws.customers.title": { en: "Customers", zh: "客户", ms: "Pelanggan" },
  "ws.customers.summary": { en: "{n} customers · Rider Passport for every bike", zh: "{n} 位客户 · 每辆摩托都有车手护照", ms: "{n} pelanggan · Pasport Penunggang untuk setiap motosikal" },
  "ws.customers.search-placeholder": { en: "Search name or phone…", zh: "搜索姓名或电话…", ms: "Cari nama atau telefon…" },
  "ws.customers.since": { en: "since", zh: "自", ms: "sejak" },
  "ws.customers.col-customer": { en: "Customer", zh: "客户", ms: "Pelanggan" },
  "ws.customers.col-motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "ws.customers.col-visits": { en: "Visits", zh: "到访", ms: "Lawatan" },
  "ws.customers.col-lifetime-spend": { en: "Lifetime Spend", zh: "累计消费", ms: "Perbelanjaan Sepanjang Hayat" },
  "ws.customers.col-last-visit": { en: "Last Visit", zh: "最近到访", ms: "Lawatan Terakhir" },
  "ws.customers.due": { en: "DUE", zh: "已到期", ms: "TAMAT TEMPOH" },
  "ws.customers.due-soon": { en: "DUE SOON", zh: "即将到期", ms: "HAMPER TAMAT" },
  "ws.customers.upcoming": { en: "UPCOMING", zh: "待保养", ms: "AKAN DATANG" },
  "ws.customers.booked": { en: "BOOKED", zh: "已预约", ms: "DITEMPAH" },

  // --- workshop: staff ---
  "ws.staff.title": { en: "Staff", zh: "员工", ms: "Staf" },
  "ws.staff.subtitle": { en: "{n} team members · add mechanics and counter staff here", zh: "{n} 名团队成员 · 在此添加机械师和前台员工", ms: "{n} ahli pasukan · tambah mekanik dan staf kaunter di sini" },

  // --- rider book page ---
  "rider.book-with-promo": { en: "Booking with promo: ", zh: "使用优惠码预约：", ms: "Tempahan dengan promo: " },

  // --- rider bookings page ---
  "rider.no-bookings": { en: "No bookings yet.", zh: "还没有预约。", ms: "Belum ada tempahan." },
  "rider.view-live-status": { en: "View live status →", zh: "查看实时状态 →", ms: "Lihat status terkini →" },

  // --- rider invoices page ---
  "rider.no-invoices": { en: "No invoices yet.", zh: "还没有发票。", ms: "Belum ada invois." },
  "rider.invoice-total": { en: "TOTAL", zh: "总计", ms: "JUMLAH" },
  "rider.paid": { en: "Paid", zh: "已支付", ms: "Dibayar" },
  "rider.service": { en: "Service", zh: "服务", ms: "Servis" },

  // --- rider service history page ---
  "rider.general-service": { en: "General Service", zh: "常规保养", ms: "Servis Am" },
  "rider.no-history": { en: "No service history yet.", zh: "还没有服务记录。", ms: "Belum ada sejarah servis." },

  // --- rider profile page ---
  "rider.member-since": { en: "Member since", zh: "会员自", ms: "Ahli sejak" },
  "rider.profile-services": { en: "Services", zh: "服务次数", ms: "Servis" },
  "rider.profile-reviews": { en: "Reviews", zh: "评价", ms: "Ulasan" },
  "rider.latest-message": { en: "LATEST MESSAGE", zh: "最新消息", ms: "MESEJ TERKINI" },
  "rider.msg-read": { en: "Read", zh: "已读", ms: "Dibaca" },
  "rider.msg-delivered": { en: "Delivered", zh: "已送达", ms: "Dihantar" },
  "rider.no-notifications": { en: "No notifications.", zh: "暂无通知。", ms: "Tiada notifikasi." },
  "rider.messages": { en: "Messages", zh: "消息", ms: "Mesej" },
  "rider.you": { en: "You", zh: "你", ms: "Anda" },
  "rider.demo-persona": { en: "demo persona: Customer", zh: "演示角色：客户", ms: "persona demo: Pelanggan" },

  // --- rider motorcycle passport page ---
  "rider.verified-services": { en: "Verified Services", zh: "已验证服务", ms: "Servis Disahkan" },
  "rider.last-service": { en: "Last Service", zh: "上次保养", ms: "Servis Terakhir" },
  "rider.lifetime-maintenance": { en: "Lifetime Maintenance", zh: "终身维护", ms: "Penyelenggaraan Sepanjang Hayat" },
  "rider.maintenance-cycle": { en: "Maintenance Cycle", zh: "保养周期", ms: "Kitaran Penyelenggaraan" },
  "rider.maintenance-cycle-desc": { en: "Tracked from verified services — when to replace next", zh: "根据已验证服务跟踪——何时更换", ms: "Jejak daripada servis disahkan — bila perlu ganti" },
  "rider.engine-oil": { en: "Engine Oil", zh: "机油", ms: "Minyak Enjin" },
  "rider.oil-filter": { en: "Oil Filter", zh: "机油滤芯", ms: "Penapis Minyak" },
  "rider.chain-sprocket": { en: "Chain & Sprocket", zh: "链条与链轮", ms: "Rantai & Gegancu" },
  "rider.no-record": { en: "No record yet", zh: "暂无记录", ms: "Tiada rekod lagi" },
  "rider.replace-now": { en: "Replace now", zh: "立即更换", ms: "Ganti sekarang" },
  "rider.replace-at": { en: "Replace at", zh: "更换于", ms: "Ganti pada" },
  "rider.inspection-history": { en: "Inspection History", zh: "检查历史", ms: "Sejarah Pemeriksaan" },
  "rider.inspection-history-desc": { en: "Findings flagged during checks and how they were resolved", zh: "检查中标记的问题及处理方式", ms: "Penemuan yang ditanda semasa pemeriksaan dan cara ia diselesaikan" },
  "rider.fixed": { en: "✓ Fixed", zh: "✓ 已修复", ms: "✓ Dibetulkan" },
  "rider.declined": { en: "Declined", zh: "已拒绝", ms: "Ditolak" },
  "rider.noted": { en: "Noted", zh: "已记录", ms: "Dicatat" },
  "rider.verified-history": { en: "Verified Service History", zh: "已验证服务历史", ms: "Sejarah Servis Disahkan" },
  "rider.no-verified": { en: "No verified services yet.", zh: "还没有已验证的服务。", ms: "Belum ada servis disahkan." },

};

export function t(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang];
}

export function parseLang(v: string | undefined): Lang {
  return (LANGS as string[]).includes(v ?? "") ? (v as Lang) : "en";
}
