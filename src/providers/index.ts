// Provider registry — single composition root (§11).
export { messagingProvider } from "./messaging/mock-whatsapp";
export { aiProvider } from "./ai/mock-ai";
export { paymentProvider } from "./payment/mock-payment";
export { storageProvider } from "./storage/local";
export { notificationProvider } from "./notification/local";
export type {
  MessagingProvider,
  AiProvider,
  StorageProvider,
  PaymentProvider,
  NotificationProvider,
  MessageSendResult,
} from "./types";
