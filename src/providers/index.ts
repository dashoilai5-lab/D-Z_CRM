// Provider registry — single composition root (§11).
// Selection: real vendors when their env key is present; otherwise mocks
// (deterministic, safe). Adding a real provider = create impl + flip the env.
import { messagingProvider as mockMessaging } from "./messaging/mock-whatsapp";
import { messagingProvider as whatsappBusiness } from "./messaging/whatsapp-business";
import { aiProvider as mockAi } from "./ai/mock-ai";
import { aiProvider as openai } from "./ai/openai";
import { paymentProvider } from "./payment/mock-payment";
import { storageProvider as localStorage } from "./storage/local";
import { storageProvider as supabaseStorage } from "./storage/supabase";
import { notificationProvider } from "./notification/local";
export type {
  MessagingProvider,
  AiProvider,
  StorageProvider,
  PaymentProvider,
  NotificationProvider,
  MessageSendResult,
} from "./types";

// Storage: production → Supabase Storage (serverless has no persistent disk);
// dev/e2e → local filesystem. Both satisfy the StorageProvider interface.
export const storageProvider =
  process.env.NODE_ENV === "production" ? supabaseStorage : localStorage;

// Messaging: real WhatsApp Business API when WHATSAPP_API_TOKEN configured,
// else mock (record-only). 拿到 Meta 密钥后只需在 Vercel env 配置，代码零改动。
export const messagingProvider =
  process.env.WHATSAPP_API_TOKEN ? whatsappBusiness : mockMessaging;

// AI: real OpenAI when OPENAI_API_KEY configured, else mock (canned text).
export const aiProvider =
  process.env.OPENAI_API_KEY ? openai : mockAi;

export { paymentProvider, notificationProvider };
