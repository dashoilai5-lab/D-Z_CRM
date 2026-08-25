import type { AiProvider } from "../types";

/**
 * OpenAIProvider — OpenAI chat completions (§31 provider 换真 B 阶段)。
 *
 * 使用（需要 OPENAI_API_KEY 后）：
 *   OPENAI_API_KEY — platform.openai.com 生成的密钥
 *
 * 未配置密钥时构造不抛错、generate 返回兜底文案（fail-safe）。
 * 业务层不感知，只替换 providers/index.ts 的导出。
 *
 * 接入步骤（预研结论，见 docs/SETUP §5 阶段 B）：
 *  1. platform.openai.com 创建 API key（billing 需绑定）
 *  2. 把 OPENAI_API_KEY 配置到 Vercel production env
 *  3. providers/index.ts 的 aiProvider 换成 OpenAIProvider
 *
 * 模型：gpt-4o-mini（成本低，适合草稿/摘要/推荐类短文本）。
 */
export class OpenAIProvider implements AiProvider {
  readonly name = "openai";

  private get apiKey() { return process.env.OPENAI_API_KEY; }

  async generate(prompt: string, opts?: { maxTokens?: number }): Promise<string> {
    const key = this.apiKey;
    if (!key) {
      return "D&Z Smart Workshop — servis berkualiti untuk motosikal anda.";
    }
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: opts?.maxTokens ?? 200,
        }),
      });
      const data = await res.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
      if (!res.ok || data.error) {
        return "D&Z Smart Workshop — servis berkualiti untuk motosikal anda.";
      }
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch {
      return "D&Z Smart Workshop — servis berkualiti untuk motosikal anda.";
    }
  }
}

export const aiProvider = new OpenAIProvider();
