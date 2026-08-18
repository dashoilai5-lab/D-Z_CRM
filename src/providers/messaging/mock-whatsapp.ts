import type { MessagingProvider, MessageSendResult } from "../types";

/**
 * MockMessagingProvider (§31). Simulates Meta WhatsApp Business API.
 * Messages are persisted to the customer history by the calling service —
 * this provider only fabricates a delivery outcome.
 */
export class MockMessagingProvider implements MessagingProvider {
  readonly name = "mock-whatsapp";

  async send(to: string, body: string): Promise<MessageSendResult> {
    await new Promise((r) => setTimeout(r, 60));
    return { ok: true, externalId: "mock-whatsapp-" + Math.random().toString(36).slice(2, 10), status: "SENT" };
  }
}

export const messagingProvider = new MockMessagingProvider();
