// Workshop OS 渐进式引导 —— 每个功能页的引导步骤定义。
// 用户在**首次进入某个功能页**时，才触发该页的引导（不一次过预览全部）。

export interface TutorialStep {
  /** 要高亮的元素：CSS selector。空串 = 高亮整页（页面开头导语）。 */
  target: string;
  /** i18n 文案 key（tutorial.<page>.<step>.title / .body） */
  titleKey: string;
  bodyKey: string;
  /** 气泡相对目标的位置 */
  placement: "top" | "bottom" | "left" | "right";
}

export interface TutorialDef {
  /** 功能 id（用于 localStorage 进度键 + 帮助菜单展示） */
  id: string;
  /** 该功能页面的路径前缀（用于匹配当前路由） */
  route: string;
  /** 帮助菜单/标题显示用的 i18n key（导航名） */
  labelKey: string;
  steps: TutorialStep[];
}

/**
 * Workshop OS 功能引导目录。
 * 覆盖老板/前台/技师视角的核心模块。每个 def 是「用户到该页才出现」的引导。
 * 若要扩展，只需新增一条 def + 对应 i18n 文案；完全不用改运行器代码。
 */
export const WORKSHOP_TUTORIALS: TutorialDef[] = [
  {
    id: "dashboard",
    route: "/workshop/dashboard",
    labelKey: "nav.dashboard",
    steps: [
      { target: "", titleKey: "tut.dashboard.0.title", bodyKey: "tut.dashboard.0.body", placement: "bottom" },
      { target: "[data-tut='greeting']", titleKey: "tut.dashboard.1.title", bodyKey: "tut.dashboard.1.body", placement: "bottom" },
      { target: "[data-tut='stats']", titleKey: "tut.dashboard.2.title", bodyKey: "tut.dashboard.2.body", placement: "bottom" },
      { target: "[data-tut='board']", titleKey: "tut.dashboard.3.title", bodyKey: "tut.dashboard.3.body", placement: "top" },
    ],
  },
  {
    id: "bookings",
    route: "/workshop/bookings",
    labelKey: "nav.bookings",
    steps: [
      { target: "", titleKey: "tut.bookings.0.title", bodyKey: "tut.bookings.0.body", placement: "bottom" },
      { target: "[data-tut='bookings-filters']", titleKey: "tut.bookings.1.title", bodyKey: "tut.bookings.1.body", placement: "bottom" },
      { target: "[data-tut='bookings-list']", titleKey: "tut.bookings.2.title", bodyKey: "tut.bookings.2.body", placement: "top" },
    ],
  },
  {
    id: "customers",
    route: "/workshop/customers",
    labelKey: "nav.customers",
    steps: [
      { target: "", titleKey: "tut.customers.0.title", bodyKey: "tut.customers.0.body", placement: "bottom" },
      { target: "[data-tut='customers-search']", titleKey: "tut.customers.1.title", bodyKey: "tut.customers.1.body", placement: "bottom" },
      { target: "[data-tut='customers-list']", titleKey: "tut.customers.2.title", bodyKey: "tut.customers.2.body", placement: "top" },
    ],
  },
  {
    id: "jobs",
    route: "/workshop/jobs",
    labelKey: "nav.jobs",
    steps: [
      { target: "", titleKey: "tut.jobs.0.title", bodyKey: "tut.jobs.0.body", placement: "bottom" },
      { target: "[data-tut='jobs-filter']", titleKey: "tut.jobs.1.title", bodyKey: "tut.jobs.1.body", placement: "bottom" },
      { target: "[data-tut='jobs-board']", titleKey: "tut.jobs.2.title", bodyKey: "tut.jobs.2.body", placement: "top" },
    ],
  },
  {
    id: "analytics",
    route: "/workshop/analytics",
    labelKey: "nav.analytics",
    steps: [
      { target: "", titleKey: "tut.analytics.0.title", bodyKey: "tut.analytics.0.body", placement: "bottom" },
      { target: "[data-tut='analytics-range']", titleKey: "tut.analytics.1.title", bodyKey: "tut.analytics.1.body", placement: "bottom" },
      { target: "[data-tut='analytics-chart']", titleKey: "tut.analytics.2.title", bodyKey: "tut.analytics.2.body", placement: "top" },
    ],
  },
  {
    id: "products",
    route: "/workshop/inventory/products",
    labelKey: "nav.products",
    steps: [
      { target: "", titleKey: "tut.products.0.title", bodyKey: "tut.products.0.body", placement: "bottom" },
      { target: "[data-tut='products-list']", titleKey: "tut.products.1.title", bodyKey: "tut.products.1.body", placement: "top" },
    ],
  },
  {
    id: "stock",
    route: "/workshop/inventory/stock",
    labelKey: "nav.stock",
    steps: [
      { target: "", titleKey: "tut.stock.0.title", bodyKey: "tut.stock.0.body", placement: "bottom" },
      { target: "[data-tut='stock-list']", titleKey: "tut.stock.1.title", bodyKey: "tut.stock.1.body", placement: "top" },
    ],
  },
  {
    id: "alerts",
    route: "/workshop/inventory/alerts",
    labelKey: "nav.alerts",
    steps: [
      { target: "", titleKey: "tut.alerts.0.title", bodyKey: "tut.alerts.0.body", placement: "bottom" },
      { target: "[data-tut='alerts-list']", titleKey: "tut.alerts.1.title", bodyKey: "tut.alerts.1.body", placement: "top" },
    ],
  },
  {
    id: "motorcycles",
    route: "/workshop/motorcycles",
    labelKey: "nav.motorcycles",
    steps: [
      { target: "", titleKey: "tut.motorcycles.0.title", bodyKey: "tut.motorcycles.0.body", placement: "bottom" },
      { target: "[data-tut='motorcycles-search']", titleKey: "tut.motorcycles.1.title", bodyKey: "tut.motorcycles.1.body", placement: "bottom" },
      { target: "[data-tut='motorcycles-list']", titleKey: "tut.motorcycles.2.title", bodyKey: "tut.motorcycles.2.body", placement: "top" },
    ],
  },
  {
    id: "packages",
    route: "/workshop/packages",
    labelKey: "nav.packages",
    steps: [
      { target: "", titleKey: "tut.packages.0.title", bodyKey: "tut.packages.0.body", placement: "bottom" },
      { target: "[data-tut='packages-grid']", titleKey: "tut.packages.1.title", bodyKey: "tut.packages.1.body", placement: "top" },
    ],
  },
  {
    id: "tasks",
    route: "/workshop/tasks",
    labelKey: "nav.tasks",
    steps: [
      { target: "", titleKey: "tut.tasks.0.title", bodyKey: "tut.tasks.0.body", placement: "bottom" },
      { target: "[data-tut='tasks-list']", titleKey: "tut.tasks.1.title", bodyKey: "tut.tasks.1.body", placement: "top" },
    ],
  },
  {
    id: "profit",
    route: "/workshop/finance/profit",
    labelKey: "nav.profit",
    steps: [
      { target: "", titleKey: "tut.profit.0.title", bodyKey: "tut.profit.0.body", placement: "bottom" },
      { target: "[data-tut='profit-range']", titleKey: "tut.profit.1.title", bodyKey: "tut.profit.1.body", placement: "bottom" },
      { target: "[data-tut='profit-cards']", titleKey: "tut.profit.2.title", bodyKey: "tut.profit.2.body", placement: "top" },
    ],
  },
  {
    id: "kpi",
    route: "/workshop/staff/kpi",
    labelKey: "nav.kpi",
    steps: [
      { target: "", titleKey: "tut.kpi.0.title", bodyKey: "tut.kpi.0.body", placement: "bottom" },
      { target: "[data-tut='kpi-table']", titleKey: "tut.kpi.1.title", bodyKey: "tut.kpi.1.body", placement: "top" },
    ],
  },
  {
    id: "settlements",
    route: "/workshop/settlements",
    labelKey: "nav.settlements",
    steps: [
      { target: "", titleKey: "tut.settlements.0.title", bodyKey: "tut.settlements.0.body", placement: "bottom" },
      { target: "[data-tut='settlements-filter']", titleKey: "tut.settlements.1.title", bodyKey: "tut.settlements.1.body", placement: "bottom" },
      { target: "[data-tut='settlements-table']", titleKey: "tut.settlements.2.title", bodyKey: "tut.settlements.2.body", placement: "top" },
    ],
  },
  {
    id: "calendar",
    route: "/workshop/marketing/calendar",
    labelKey: "nav.calendar",
    steps: [
      { target: "", titleKey: "tut.calendar.0.title", bodyKey: "tut.calendar.0.body", placement: "bottom" },
      { target: "[data-tut='calendar-list']", titleKey: "tut.calendar.1.title", bodyKey: "tut.calendar.1.body", placement: "top" },
    ],
  },
  {
    id: "reminders",
    route: "/workshop/crm/reminders",
    labelKey: "nav.reminders",
    steps: [
      { target: "", titleKey: "tut.reminders.0.title", bodyKey: "tut.reminders.0.body", placement: "bottom" },
      { target: "[data-tut='reminders-table']", titleKey: "tut.reminders.1.title", bodyKey: "tut.reminders.1.body", placement: "top" },
    ],
  },
];
