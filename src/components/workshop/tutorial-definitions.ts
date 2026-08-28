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
];
