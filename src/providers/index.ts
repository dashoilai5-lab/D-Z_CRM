// Provider registry — single composition root (§11).
// Selection: production uses real vendors; dev/e2e keep mocks (deterministic).
export { messagingProvider } from "./messaging/mock-whatsapp";
export { aiProvider } from "./ai/mock-ai";
export { paymentProvider } from "./payment/mock-payment";
import { storageProvider as localStorage } from "./storage/local";
import { storageProvider as supabaseStorage } from "./storage/supabase";
export { notificationProvider } from "./notification/local";
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
