import type { NotificationProvider, MessageSendResult } from "../types";

/** LocalNotificationProvider — prototype stand-in for push notifications. */
export class LocalNotificationProvider implements NotificationProvider {
  readonly name = "local-notification";

  async notify(_to: string, _title: string, _body: string): Promise<MessageSendResult> {
    return { ok: true, externalId: "local-" + Date.now(), status: "DELIVERED" };
  }
}

export const notificationProvider = new LocalNotificationProvider();
