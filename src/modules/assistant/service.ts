import "server-only";
import { aiProvider } from "@/providers";
import type { AiChatMessage } from "@/providers/types";
import type { Lang } from "@/lib/i18n";
import { detectIntent } from "./router";
import { runTool, GUIDES, type AssistantCtx } from "./tools";
import { buildSystemPrompt, sanitizeReply } from "./prompt";

export interface AssistantUserMessage { role: "user" | "assistant"; content: string; }

export async function askAssistant(args: { messages: AssistantUserMessage[]; lang: Lang; ctx: AssistantCtx; }): Promise<string> {
  const { messages, lang, ctx } = args;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const intent = detectIntent(lastUser);

  let contextBlock = "";
  let guide = "";
  if (intent.kind !== "general") {
    if (intent.kind === "guide") {
      guide = GUIDES[intent.guide].steps.map((s, i) => (i + 1) + ". " + s).join("\n");
    } else {
      const res = await runTool(intent.kind, ctx);
      if (res.context) contextBlock = res.context;
    }
  }

  const final: AiChatMessage[] = [{ role: "system", content: buildSystemPrompt(lang) }];
  for (const m of messages.slice(-8)) {
    final.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content });
  }

  if (contextBlock || guide) {
    let lastUserIdx = -1;
    for (let i = final.length - 1; i >= 0; i--) {
      if (final[i].role === "user") { lastUserIdx = i; break; }
    }
    if (lastUserIdx >= 0) {
      let extra = "";
      if (contextBlock) extra += "\n\n【上下文】(REAL current data — use these as facts, do not invent)\n" + contextBlock;
      if (guide) extra += "\n\n【指南】(how-to guide for the user's question)\n" + guide;
      final[lastUserIdx] = { role: "user", content: final[lastUserIdx].content + extra };
    }
  }

  const raw = await aiProvider.chat(final, { maxTokens: 700, temperature: 0.4 });
  return sanitizeReply(raw);
}
