// Rider App 渐进式引导 —— 顾客端功能页引导定义（手机窄屏）。
// 首次进入某功能页才触发该页引导；无车用户先注册车（bike-first）后再开始。

export interface RiderTutorialStep {
  target: string;
  titleKey: string;
  bodyKey: string;
  placement: "top" | "bottom" | "left" | "right";
}

export interface RiderTutorialDef {
  id: string;
  route: string;
  labelKey: string;
  steps: RiderTutorialStep[];
}

export const RIDER_TUTORIALS: RiderTutorialDef[] = [
  {
    id: "welcome",
    route: "/rider/home",
    labelKey: "navr.home",
    steps: [
      { target: "", titleKey: "tutr.welcome.0.title", bodyKey: "tutr.welcome.0.body", placement: "bottom" },
      { target: "[data-tut='rider-hello']", titleKey: "tutr.welcome.1.title", bodyKey: "tutr.welcome.1.body", placement: "bottom" },
      { target: "[data-tut='rider-bike']", titleKey: "tutr.welcome.2.title", bodyKey: "tutr.welcome.2.body", placement: "top" },
    ],
  },
  {
    id: "book",
    route: "/rider/book",
    labelKey: "navr.book",
    steps: [
      { target: "", titleKey: "tutr.book.0.title", bodyKey: "tutr.book.0.body", placement: "bottom" },
      { target: "[data-tut='rider-book-package']", titleKey: "tutr.book.1.title", bodyKey: "tutr.book.1.body", placement: "top" },
    ],
  },
  {
    id: "motorcycles",
    route: "/rider/motorcycles",
    labelKey: "navr.my-bike",
    steps: [
      { target: "", titleKey: "tutr.motorcycles.0.title", bodyKey: "tutr.motorcycles.0.body", placement: "bottom" },
      { target: "[data-tut='rider-motorcycles-list']", titleKey: "tutr.motorcycles.1.title", bodyKey: "tutr.motorcycles.1.body", placement: "top" },
    ],
  },
  {
    id: "profile",
    route: "/rider/profile",
    labelKey: "navr.profile",
    steps: [
      { target: "", titleKey: "tutr.profile.0.title", bodyKey: "tutr.profile.0.body", placement: "bottom" },
      { target: "[data-tut='rider-profile-card']", titleKey: "tutr.profile.1.title", bodyKey: "tutr.profile.1.body", placement: "top" },
    ],
  },
  {
    id: "service-status",
    route: "/rider/service-status",
    labelKey: "nav.service-status",
    steps: [
      { target: "", titleKey: "tutr.service-status.0.title", bodyKey: "tutr.service-status.0.body", placement: "bottom" },
      { target: "[data-tut='rider-status-progress']", titleKey: "tutr.service-status.1.title", bodyKey: "tutr.service-status.1.body", placement: "top" },
    ],
  },
  {
    id: "approvals",
    route: "/rider/approvals",
    labelKey: "nav.approvals",
    steps: [
      { target: "", titleKey: "tutr.approvals.0.title", bodyKey: "tutr.approvals.0.body", placement: "bottom" },
      { target: "[data-tut='rider-approvals-list']", titleKey: "tutr.approvals.1.title", bodyKey: "tutr.approvals.1.body", placement: "top" },
    ],
  },
];
