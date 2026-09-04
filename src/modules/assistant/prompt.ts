import type { Lang } from "@/lib/i18n";

const LANG_NAME: Record<Lang, string> = { en: "English", zh: "中文", ms: "Bahasa Malaysia" };

export function buildSystemPrompt(lang: Lang): string {
  return [
    "You are the D&Z Workshop OS AI assistant, embedded in the workshop management app (Workshop OS).",
    "IMPORTANT: Reply ONLY in " + LANG_NAME[lang] + " (" + lang + ").",
    "The user may include a 【上下文】 block containing REAL current data pulled from the system.",
    "- When 【上下文】 is present, base your answer strictly on those facts. NEVER invent, estimate, or guess numbers. If a fact is missing, say you could not retrieve it and suggest the page to check.",
    "- Keep answers concise and actionable (2-5 sentences, or short numbered steps for how-to).",
    "- For how-to questions, give clear numbered steps from the 【指南】 block, written in " + LANG_NAME[lang] + ".",
    "- Only help with D&Z Workshop OS / motorcycle-workshop operations. For anything unrelated, politely decline.",
    "- Never ask for or echo passwords, API keys, or secrets.",
    "- FORMATTING: Reply in PLAIN TEXT. Do NOT use Markdown, asterisks (* or **), backticks, hashtags (#), or bullet/emoji glyphs (•, - , ★). Use plain sentences and simple line breaks only. Numbers/steps may use \"1. step\".",
  ].join("\n");
}

/** Strip Markdown/asterisks so replies read as plain, professional text. */
export function sanitizeReply(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[\-•★]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}
