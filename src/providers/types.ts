// Provider abstractions (§11). Business modules depend on these interfaces,
// never on a specific vendor. Prototype = mock impls; production = real vendors.

export interface MessageSendResult {
  ok: boolean;
  externalId: string | null;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
}

export interface MessagingProvider {
  readonly name: string;
  send(to: string, body: string, opts?: { template?: string }): Promise<MessageSendResult>;
  /** Production: Meta WhatsApp Business API. Prototype: MockMessagingProvider. */
}

export interface AiProvider {
  readonly name: string;
  generate(prompt: string, opts?: { maxTokens?: number }): Promise<string>;
  /** Multi-turn chat with optional system message. Production: OpenAI. Prototype: MockAIProvider (rule-based canned text). */
  chat(messages: AiChatMessage[], opts?: { maxTokens?: number; temperature?: number }): Promise<string>;
}

/** A chat message for the AiProvider.chat (system / user / assistant). */
export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StorageProvider {
  readonly name: string;
  put(key: string, data: Uint8Array, contentType: string): Promise<string>;
  get(key: string): Promise<Uint8Array | null>;
  /** Production: Supabase Storage. Prototype: LocalStorageProvider (./storage). */
}

export interface PaymentProvider {
  readonly name: string;
  charge(amountSen: number, reference: string, method: string): Promise<{ ok: boolean; paidAt: Date }>;
  /** Production: Payment Gateway. Prototype: MockPaymentProvider (auto-succeed). */
}

export interface NotificationProvider {
  readonly name: string;
  notify(to: string, title: string, body: string): Promise<MessageSendResult>;
  /** Production: Push notifications. Prototype: LocalNotificationProvider. */
}
