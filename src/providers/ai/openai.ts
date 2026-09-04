import type { AiProvider, AiChatMessage } from "../types";

/**
 * OpenAIProvider — OpenAI chat completions (§31 provider 换真 B 阶段)。
 *
 * 使用（需要 OPENAI_API_KEY 后）：
 *   OPENAI_API_KEY  — platform.openai.com 生成的密钥
 *   OPENAI_MODEL    — 模型名（缺省 gpt-4o-mini；Workshop AI Assistant 用多轮 chat，非单发 generate）
 *
 * 未配置密钥时构造不抛错、generate/chat 返回兜底文案（fail-safe）。
 * 业务层不感知，只替换 providers/index.ts 的导出。
 */
export class OpenAIProvider implements AiProvider {
  readonly name = "openai";

  private get apiKey() { return process.env.OPENAI_API_KEY; }
  private get model() { return process.env.OPENAI_MODEL || "gpt-4o-mini"; }

  private fallback() {
    return "D&Z Smart Workshop — servis berkualiti untuk motosikal anda.";
  }

  async generate(prompt: string, opts?: { maxTokens?: number }): Promise<string> {
    return this.chat([{ role: "user", content: prompt }], opts);
  }

  async chat(messages: AiChatMessage[], opts?: { maxTokens?: number; temperature?: number }): Promise<string> {
    const key = this.apiKey;
    if (!key) return this.fallback();
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: opts?.maxTokens ?? 500,
          temperature: opts?.temperature ?? 0.4,
        }),
      });
      const data = await res.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
      if (!res.ok || data.error) return this.fallback();
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch {
      return this.fallback();
    }
  }
}

export const aiProvider = new OpenAIProvider();
