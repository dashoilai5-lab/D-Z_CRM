/** Rider 通知偏好（Settings → Notifications）。 */
export type NotificationPrefs = {
  serviceReminders: boolean;
  bookingUpdates: boolean;
  marketingOffers: boolean;
  appNews: boolean;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  serviceReminders: true,
  bookingUpdates: true,
  marketingOffers: true,
  appNews: true,
};

/** 容错解析 DB 里可能为 null / 缺键的 JSON 偏好。 */
export function parsePrefs(raw: unknown): NotificationPrefs {
  const o = (raw ?? {}) as Partial<NotificationPrefs>;
  return {
    serviceReminders: o.serviceReminders ?? DEFAULT_PREFS.serviceReminders,
    bookingUpdates: o.bookingUpdates ?? DEFAULT_PREFS.bookingUpdates,
    marketingOffers: o.marketingOffers ?? DEFAULT_PREFS.marketingOffers,
    appNews: o.appNews ?? DEFAULT_PREFS.appNews,
  };
}
