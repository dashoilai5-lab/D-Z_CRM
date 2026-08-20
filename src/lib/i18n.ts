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
  "nav.leads": { en: "Leads", zh: "线索", ms: "Prospek" },
  "nav.pipeline": { en: "Pipeline", zh: "管道", ms: "Saluran" },
  "nav.test-rides": { en: "Test Rides", zh: "试驾", ms: "Ujian Tunggang" },
  "nav.tasks": { en: "Tasks", zh: "任务", ms: "Tugas" },
  "nav.motorcycles": { en: "Motorcycles", zh: "摩托车", ms: "Motorsikal" },
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

  // --- workshop marketing: campaign calendar ---
  "ws.mkt.calendar.title": { en: "Promotion Calendar", zh: "促销日历", ms: "Kalendar Promosi" },
  "ws.mkt.calendar.campaigns": { en: "{n} campaigns", zh: "{n} 场活动", ms: "{n} kempen" },
  "ws.mkt.calendar.promo-live": { en: "{n} promo(s) live now", zh: "{n} 个促销进行中", ms: "{n} promosi aktif" },
  "ws.mkt.calendar.customers-due": { en: "{n} customers due", zh: "{n} 位客户到期", ms: "{n} pelanggan tamat" },
  "ws.mkt.calendar.customers-due-label": { en: "customers due", zh: "位客户到期", ms: "pelanggan tamat" },
  "ws.mkt.calendar.bookings-driven": { en: "bookings driven", zh: "笔预约转化", ms: "tempahan dijana" },
  "ws.mkt.calendar.all": { en: "All", zh: "全部", ms: "Semua" },
  "ws.mkt.calendar.type.RETURN": { en: "Return", zh: "回流", ms: "Pulangan" },
  "ws.mkt.calendar.type.REMINDER": { en: "Reminder", zh: "提醒", ms: "Peringatan" },
  "ws.mkt.calendar.type.PROMO": { en: "Promo", zh: "促销", ms: "Promosi" },
  "ws.mkt.calendar.type.NEWS": { en: "News", zh: "资讯", ms: "Berita" },
  "ws.mkt.calendar.empty": { en: "No campaigns yet — create the first one.", zh: "还没有活动——创建第一个吧。", ms: "Belum ada kempen — cipta yang pertama." },
  "ws.mkt.status.ACTIVE": { en: "ACTIVE", zh: "进行中", ms: "AKTIF" },
  "ws.mkt.status.SCHEDULED": { en: "SCHEDULED", zh: "已排期", ms: "DIJADUALKAN" },
  "ws.mkt.status.DRAFT": { en: "DRAFT", zh: "草稿", ms: "DRAF" },
  "ws.mkt.status.ENDED": { en: "ENDED", zh: "已结束", ms: "TAMAT" },

  // --- workshop marketing: poster library ---
  "ws.mkt.posters.title": { en: "Poster Library", zh: "海报库", ms: "Perpustakaan Poster" },
  "ws.mkt.posters.packs": { en: "{n} poster packs", zh: "{n} 套海报", ms: "{n} pakej poster" },
  "ws.mkt.posters.generated": { en: "generated with mocked AI content", zh: "由模拟 AI 内容生成", ms: "dijana dengan kandungan AI tiruan" },
  "ws.mkt.posters.empty": { en: "No posters yet — add the first one.", zh: "还没有海报——添加第一张吧。", ms: "Belum ada poster — tambah yang pertama." },

  // --- workshop marketing: reels script bank ---
  "ws.mkt.scripts.title": { en: "Reels Script Bank", zh: "脚本库", ms: "Bank Skrip" },
  "ws.mkt.scripts.count": { en: "{n} scripts", zh: "{n} 个脚本", ms: "{n} skrip" },
  "ws.mkt.scripts.templates": { en: "TikTok / Reels templates for the workshop", zh: "适用于车间的 TikTok / Reels 模板", ms: "Templat TikTok / Reels untuk bengkel" },
  "ws.mkt.scripts.empty": { en: "No scripts yet — add the first one.", zh: "还没有脚本——添加第一个吧。", ms: "Belum ada skrip — tambah yang pertama." },

  // --- workshop marketing: reviews ---
  "ws.mkt.reviews.title": { en: "Reviews", zh: "评价", ms: "Ulasan" },
  "ws.mkt.reviews.avg": { en: "Average rating {r} ★ across {n} reviews", zh: "平均评分 {r} ★ 共 {n} 条评价", ms: "Purata penilaian {r} ★ merentas {n} ulasan" },
  "ws.mkt.reviews.sub": { en: "publish & reply to manage reputation", zh: "发布与回复以管理口碑", ms: "terbit & balas untuk mengurus reputasi" },

  // --- workshop crm: service reminders ---
  "ws.crm.reminders.title": { en: "Service Reminders", zh: "保养提醒", ms: "Peringatan Servis" },
  "ws.crm.reminders.subtitle": { en: "Deterministic: next = last service + 3,000 km interval", zh: "确定性规则：下次保养 = 上次保养 + 3,000 公里间隔", ms: "Deterministik: seterusnya = servis terakhir + selang 3,000 km" },
  "ws.crm.reminders.col.customer": { en: "Customer", zh: "客户", ms: "Pelanggan" },
  "ws.crm.reminders.col.motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "ws.crm.reminders.col.last-service": { en: "Last Service", zh: "上次保养", ms: "Servis Terakhir" },
  "ws.crm.reminders.col.next-service": { en: "Next Service", zh: "下次保养", ms: "Servis Seterusnya" },
  "ws.crm.reminders.col.gap": { en: "Gap", zh: "差距", ms: "Jarak" },
  "ws.crm.reminders.est": { en: "est", zh: "预计", ms: "anggaran" },

  // --- workshop crm: customer return list ---
  "ws.crm.return.title": { en: "Customer Return List", zh: "客户回流名单", ms: "Senarai Pulangan Pelanggan" },
  "ws.crm.return.subtitle": { en: "Customers who haven't visited — segmented by days since last service", zh: "久未到访的客户——按距上次保养的天数分群", ms: "Pelanggan yang belum berkunjung — dibahagikan mengikut hari sejak servis terakhir" },
  "ws.crm.return.seg.30_PLUS": { en: "30+ Days", zh: "30+ 天", ms: "30+ Hari" },
  "ws.crm.return.seg.60_PLUS": { en: "60+ Days", zh: "60+ 天", ms: "60+ Hari" },
  "ws.crm.return.seg.90_PLUS": { en: "90+ Days", zh: "90+ 天", ms: "90+ Hari" },
  "ws.crm.return.seg.LOST_CUSTOMER": { en: "Lost Customer", zh: "流失客户", ms: "Pelanggan Hilang" },
  "ws.crm.return.col.customer": { en: "Customer", zh: "客户", ms: "Pelanggan" },
  "ws.crm.return.col.motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "ws.crm.return.col.last-service": { en: "Last Service", zh: "上次保养", ms: "Servis Terakhir" },
  "ws.crm.return.col.days": { en: "Days", zh: "天数", ms: "Hari" },
  "ws.crm.return.col.lifetime-value": { en: "Lifetime Value", zh: "终身价值", ms: "Nilai Sepanjang Hayat" },
  "ws.crm.return.col.segment": { en: "Segment", zh: "分组", ms: "Segmen" },
  "ws.crm.return.col.recommended-action": { en: "Recommended Action", zh: "建议行动", ms: "Tindakan Disyorkan" },
  "ws.crm.return.view-passport": { en: "View Passport", zh: "查看护照", ms: "Lihat Pasport" },
  "ws.crm.return.create-booking": { en: "Create Booking", zh: "创建预约", ms: "Cipta Tempahan" },

  // --- workshop inventory: dead stock ---
  "ws.dead.title": { en: "Dead Stock", zh: "滞销库存", ms: "Stok Mati" },
  "ws.dead.subtitle": { en: "60 days slow · 90 days warning · 180 days critical — total value {n}", zh: "60 天慢销 · 90 天预警 · 180 天严重 —— 总价值 {n}", ms: "60 hari lambat · 90 hari amaran · 180 hari kritikal — jumlah nilai {n}" },
  "ws.dead.col.product": { en: "Product", zh: "产品", ms: "Produk" },
  "ws.dead.col.stock-value": { en: "Stock Value", zh: "库存价值", ms: "Nilai Stok" },
  "ws.dead.col.last-sale": { en: "Last Sale", zh: "最近售出", ms: "Jualan Terakhir" },
  "ws.dead.col.days": { en: "Days", zh: "天数", ms: "Hari" },
  "ws.dead.col.stage": { en: "Stage", zh: "阶段", ms: "Peringkat" },
  "ws.dead.col.recommendation": { en: "Recommendation", zh: "建议", ms: "Cadangan" },
  "ws.dead.days-ago": { en: "days ago", zh: "天前", ms: "hari lalu" },
  "ws.dead.stage.CRITICAL_DEAD_STOCK": { en: "CRITICAL DEAD STOCK", zh: "严重滞销", ms: "STOK MATI KRITIKAL" },
  "ws.dead.stage.DEAD_STOCK_WARNING": { en: "DEAD STOCK WARNING", zh: "滞销预警", ms: "AMARAN STOK MATI" },
  "ws.dead.stage.SLOW_MOVING": { en: "SLOW MOVING", zh: "慢销", ms: "GERAKAN PERLAHAN" },

  // --- workshop inventory: reorder ---
  "ws.reorder.title": { en: "Auto Reorder", zh: "自动补货", ms: "Pesanan Semula Auto" },
  "ws.reorder.subtitle": { en: "Reorder point = avg daily usage × lead time + safety stock (§37)", zh: "补货点 = 平均日用量 × 交货时间 + 安全库存（§37）", ms: "Titik pesanan semula = purata penggunaan harian × masa utama + stok keselamatan (§37)" },
  "ws.reorder.current-stock": { en: "Current stock", zh: "当前库存", ms: "Stok semasa" },
  "ws.reorder.est-days-left": { en: "est days left", zh: "预计剩余天数", ms: "anggaran hari lagi" },
  "ws.reorder.recommended": { en: "Recommended:", zh: "建议补货：", ms: "Disyorkan:" },
  "ws.reorder.lead": { en: "lead", zh: "交货期", ms: "masa utama" },
  "ws.reorder.days": { en: "days", zh: "天", ms: "hari" },
  "ws.reorder.empty": { en: "No reorder recommendations right now.", zh: "暂无补货建议。", ms: "Tiada cadangan pesanan semula buat masa ini." },

  // --- workshop: job detail ---
  "ws.job.ai-recs": { en: "AI Sales Recommendations", zh: "AI 销售推荐", ms: "Cadangan Jualan AI" },
  "ws.job.col-description": { en: "Description", zh: "描述", ms: "Penerangan" },
  "ws.job.created": { en: "Created", zh: "创建于", ms: "Dicipta" },
  "ws.job.customer-approved": { en: "CUSTOMER APPROVED", zh: "客户已批准", ms: "PELANGGAN MELULUSKAN" },
  "ws.job.customer-approvals": { en: "Customer Approvals", zh: "客户审批", ms: "Kelulusan Pelanggan" },
  "ws.job.customer-declined": { en: "CUSTOMER DECLINED", zh: "客户已拒绝", ms: "PELANGGAN MENOLAK" },
  "ws.job.customer-request": { en: "Customer Request", zh: "客户要求", ms: "Permintaan Pelanggan" },
  "ws.job.estimated-total": { en: "Estimated Total", zh: "预计总计", ms: "Jumlah Anggaran" },
  "ws.job.invoice": { en: "Invoice", zh: "发票", ms: "Invois" },
  "ws.job.lines-title": { en: "Job Lines", zh: "工单明细", ms: "Baris Kerja" },
  "ws.job.no-findings": { en: "No inspection findings yet.", zh: "暂无检查结果。", ms: "Tiada penemuan pemeriksaan lagi." },
  "ws.job.no-lines": { en: "No lines yet — add a package or accept recommendations.", zh: "暂无明细——添加套餐或接受推荐。", ms: "Tiada baris lagi — tambah pakej atau terima cadangan." },
  "ws.job.paid": { en: "Paid", zh: "已支付", ms: "Dibayar" },
  "ws.job.part": { en: "Part", zh: "零件", ms: "Bahagian" },
  "ws.job.pending-approval": { en: "pending customer approval", zh: "待客户审批", ms: "menunggu kelulusan pelanggan" },
  "ws.job.pending-approvals": { en: "pending customer approvals", zh: "待客户审批", ms: "menunggu kelulusan pelanggan" },
  "ws.job.unassigned": { en: "Unassigned", zh: "未分配", ms: "Tidak Ditugaskan" },
  "ws.job.waiting-customer": { en: "WAITING CUSTOMER", zh: "等待客户", ms: "MENUNGGU PELANGGAN" },

  // --- workshop: mechanic board ---
  "ws.mech.owner-hint": { en: "Switch between mechanics to view their assigned tasks.", zh: "切换查看各机械师的任务。", ms: "Tukar antara mekanik untuk melihat tugasan mereka." },
  "ws.mech.mech-hint": { en: "Your assigned jobs — switch to see other mechanics.", zh: "你分配到的工单——切换查看其他机械师。", ms: "Kerja tugasan anda — tukar untuk melihat mekanik lain." },
  "ws.mech.unassigned": { en: "Unassigned", zh: "未分配", ms: "Tidak Ditugaskan" },

  // --- workshop: checklists ---
  "ws.checklist.default": { en: "default", zh: "默认", ms: "lalai" },
  "ws.checklist.in-progress": { en: "In progress", zh: "进行中", ms: "Dalam proses" },
  "ws.checklist.subtitle": { en: "Inspection templates used by mechanics", zh: "机械师使用的检查模板", ms: "Templat pemeriksaan yang digunakan oleh mekanik" },
  "ws.checklist.title": { en: "Inspection Checklist", zh: "检查清单", ms: "Senarai Semak Pemeriksaan" },

  // --- workshop finance: profit dashboard ---
  "ws.finance.profit.subtitle": { en: "Revenue = Sales · Gross Profit = Revenue − COGS · Margin = GP / Revenue × 100 (§38)", zh: "营收 = 销售额 · 毛利 = 营收 − 成本 · 利润率 = 毛利 / 营收 × 100（§38）", ms: "Hasil = Jualan · Untung Kasar = Hasil − KOS · Margin = UK / Hasil × 100 (§38)" },
  "ws.finance.sales-90": { en: "Sales (90 days)", zh: "销售额（90 天）", ms: "Jualan (90 hari)" },
  "ws.finance.net-profit": { en: "Net Profit", zh: "净利润", ms: "Untung Bersih" },
  "ws.finance.no-opex": { en: "Prototype: no opex model yet", zh: "原型：暂无运营支出模型", ms: "Prototaip: belum ada model opex" },
  "ws.finance.trend-title": { en: "Revenue & Gross Profit Trend", zh: "营收与毛利趋势", ms: "Trend Hasil & Untung Kasar" },
  "ws.finance.trend-sub": { en: "Last 90 days · daily", zh: "最近 90 天 · 每日", ms: "90 hari lepas · harian" },
  "ws.finance.split-title": { en: "Revenue Split", zh: "营收构成", ms: "Pecahan Hasil" },
  "ws.finance.split-sub": { en: "Service vs parts (90 days)", zh: "服务与配件对比（90 天）", ms: "Servis vs alat ganti (90 hari)" },
  "ws.finance.parts": { en: "Parts", zh: "配件", ms: "Alat Ganti" },
  "ws.finance.margin": { en: "Margin", zh: "利润率", ms: "Margin" },

  // --- workshop AI centre ---
  "ws.ai.subtitle": { en: "Rule-based in the prototype — OpenAI replaces content/summary generation later (§39)", zh: "原型为规则驱动——之后由 OpenAI 替换内容/摘要生成（§39）", ms: "Berasaskan peraturan dalam prototaip — OpenAI menggantikan penjanaan kandungan/ringkasan kemudian (§39)" },
  "ws.ai.no-recs": { en: "No recommendations — everything is on track. ✅", zh: "暂无推荐——一切正常。✅", ms: "Tiada cadangan — semuanya berjalan lancar. ✅" },

  // --- workshop staff: KPI ---
  "ws.kpi.my": { en: "My KPI", zh: "我的 KPI", ms: "KPI Saya" },
  "ws.kpi.board": { en: "Staff KPI Board", zh: "员工 KPI 看板", ms: "Papan KPI Staf" },
  "ws.kpi.my-sub": { en: "Your performance — deterministic formulas (last 30 days)", zh: "你的表现——确定性公式（最近 30 天）", ms: "Prestasi anda — formula deterministik (30 hari lepas)" },
  "ws.kpi.sub": { en: "Deterministic formulas — jobs, ticket, package & add-on conversion, checklist, rating (last 30 days)", zh: "确定性公式——工单、客单价、套餐与附加项转化、检查清单、评分（最近 30 天）", ms: "Formula deterministik — kerja, tiket, penukaran pakej & tambahan, senarai semak, penilaian (30 hari lepas)" },
  "ws.kpi.your-score": { en: "{name} — your score", zh: "{name} —— 你的得分", ms: "{name} — skor anda" },
  "ws.kpi.top-performer": { en: "{name} — top performer", zh: "{name} —— 最佳表现", ms: "{name} — pencapaian terbaik" },
  "ws.kpi.top-line": { en: "{jobs} jobs · avg ticket {ticket} · {rating}★", zh: "{jobs} 单 · 平均客单价 {ticket} · {rating}★", ms: "{jobs} kerja · purata tiket {ticket} · {rating}★" },
  "ws.kpi.col-staff": { en: "Staff", zh: "员工", ms: "Staf" },
  "ws.kpi.col-jobs": { en: "Jobs", zh: "工单", ms: "Kerja" },
  "ws.kpi.col-sales": { en: "Sales", zh: "销售额", ms: "Jualan" },
  "ws.kpi.col-avg-ticket": { en: "Avg Ticket", zh: "平均客单价", ms: "Purata Tiket" },
  "ws.kpi.col-package": { en: "Package Conv", zh: "套餐转化", ms: "Penukaran Pakej" },
  "ws.kpi.col-addon": { en: "Add-on Conv", zh: "附加项转化", ms: "Penukaran Tambahan" },
  "ws.kpi.col-checklist": { en: "Checklist", zh: "检查清单", ms: "Senarai Semak" },
  "ws.kpi.col-rating": { en: "Rating", zh: "评分", ms: "Penilaian" },
  "ws.kpi.formula-note": { en: "KPI formulas are deterministic and explainable (§33) — never AI-invented. Score = 30% jobs + 20% ticket + 15% package + 15% add-on + 10% checklist + 10% rating.", zh: "KPI 公式为确定性且可解释（§33）——绝不凭空捏造。得分 = 30% 工单 + 20% 客单价 + 15% 套餐 + 15% 附加项 + 10% 检查清单 + 10% 评分。", ms: "Formula KPI adalah deterministik dan boleh dijelaskan (§33) — tidak pernah direka oleh AI. Skor = 30% kerja + 20% tiket + 15% pakej + 15% tambahan + 10% senarai semak + 10% penilaian." },

  // --- workshop customer passport (detail) ---
  "ws.cust.since": { en: "Customer Since", zh: "客户自", ms: "Pelanggan Sejak" },
  "ws.cust.tab-overview": { en: "Overview", zh: "概览", ms: "Ringkasan" },
  "ws.cust.tab-oil": { en: "Oil History", zh: "机油历史", ms: "Sejarah Minyak" },
  "ws.cust.tab-tyres": { en: "Tyres", zh: "轮胎", ms: "Tayar" },
  "ws.cust.tab-spending": { en: "Spending", zh: "消费", ms: "Perbelanjaan" },
  "ws.cust.tab-notes": { en: "Notes", zh: "备注", ms: "Nota" },
  "ws.cust.summary-title": { en: "Service Summary", zh: "服务摘要", ms: "Ringkasan Servis" },
  "ws.cust.last-mileage": { en: "Last Mileage", zh: "上次里程", ms: "Mileage Terakhir" },
  "ws.cust.estimated": { en: "Estimated", zh: "预计", ms: "Anggaran" },
  "ws.cust.reminders": { en: "Reminders", zh: "保养提醒", ms: "Peringatan" },
  "ws.cust.col-items": { en: "Items", zh: "项目", ms: "Item" },
  "ws.cust.oil-title": { en: "Engine Oil History", zh: "机油历史", ms: "Sejarah Minyak Enjin" },
  "ws.cust.oil-empty": { en: "No oil changes recorded.", zh: "暂无换油记录。", ms: "Tiada rekod penukaran minyak." },
  "ws.cust.tyres-title": { en: "Tyre History", zh: "轮胎历史", ms: "Sejarah Tayar" },
  "ws.cust.tyres-empty": { en: "No tyre work recorded.", zh: "暂无轮胎作业记录。", ms: "Tiada rekod kerja tayar." },
  "ws.cust.msg-title": { en: "Message History", zh: "消息历史", ms: "Sejarah Mesej" },
  "ws.cust.msg-empty": { en: "No messages.", zh: "暂无消息。", ms: "Tiada mesej." },
  "ws.cust.notes-title": { en: "Internal Notes", zh: "内部备注", ms: "Nota Dalaman" },
  "ws.cust.notes-empty": { en: "No notes.", zh: "暂无备注。", ms: "Tiada nota." },
  "ws.cust.customer-note": { en: "Customer note: {notes}", zh: "客户备注：{notes}", ms: "Nota pelanggan: {notes}" },
  "ws.cust.est": { en: "· est {date}", zh: "· 预计 {date}", ms: "· anggaran {date}" },

};

export function t(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang];
}

export function parseLang(v: string | undefined): Lang {
  return (LANGS as string[]).includes(v ?? "") ? (v as Lang) : "en";
}

