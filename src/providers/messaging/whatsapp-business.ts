import type { MessagingProvider, MessageSendResult } from "../types";

/**
 * WhatsAppBusinessProvider — Meta WhatsApp Business Cloud API (§31 provider 换真 B 阶段)。
 *
 * 使用（需要 Meta 密钥后）：
 *   WHATSAPP_API_TOKEN   — Meta Graph API 长期 access token
 *   WHATSAPP_PHONE_ID    — Business 电话号码 ID（消息发送方）
 *   WHATSAPP_VERIFY_TOKEN— Webhook 验签（接收回执用，可选）
 *
 * 未配置密钥时构造不抛错、send 返回 FAILED（fail-safe）——与 MockMessagingProvider
 * 的唯一区别是这里真正调 Graph API。业务层不感知，只替换 providers/index.ts 的导出。
 *
 * 接入步骤（预研结论，见 docs/SETUP §5 阶段 B）：
 *  1. business.facebook.com 创建 WhatsApp Business 账号 → 验证企业 → 获取 Phone Number ID
 *  2. developers.facebook.com 创建 App → 生成永久 token（graph API v19+）
 *  3. 把 WHATSAPP_API_TOKEN / WHATSAPP_PHONE_ID 配置到 Vercel production env
 *  4. 把 providers/index.ts 的 messagingProvider 换成 WhatsAppBusinessProvider
 *  5. 设置 Webhook（messages webhooks）回传 delivered/read 状态 → 更新 Message.status
 *
 * 端点：POST https://graph.facebook.com/v19.0/{PHONE_ID}/messages
 */
export class WhatsAppBusinessProvider implements MessagingProvider {
  readonly name = "whatsapp-business";

  private get token() { return process.env.WHATSAPP_API_TOKEN; }
  private get phoneId() { return process.env.WHATSAPP_PHONE_ID; }

  async send(to: string, body: string): Promise<MessageSendResult> {
    const token = this.token;
    const phoneId = this.phoneId;
    if (!token || !phoneId) {
      return { ok: false, externalId: null, status: "FAILED" };
    }
    try {
      const res = await fetch("https://graph.facebook.com/v19.0/" + phoneId + "/messages", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      });
      const data = await res.json() as { messages?: { id: string }[]; error?: { message?: string } };
      if (!res.ok || data.error) {
        return { ok: false, externalId: null, status: "FAILED" };
      }
      return { ok: true, externalId: data.messages?.[0]?.id ?? null, status: "QUEUED" };
    } catch {
      return { ok: false, externalId: null, status: "FAILED" };
    }
  }
}

export const messagingProvider = new WhatsAppBusinessProvider();
