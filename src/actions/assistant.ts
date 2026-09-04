"use server";

import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { askAssistant } from "@/modules/assistant";

export async function askAssistantAction(input: {
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<{ ok: boolean; reply?: string; error?: string }> {
  const session = await getSessionUser();
  // Only authenticated staff (Workshop OS users) may use the assistant.
  if (!session.authenticated || session.kind !== "staff") {
    return { ok: false, error: "unauthorized" };
  }
  const lang = await getLang();
  try {
    if (!input?.messages?.length) return { ok: false, error: "no_message" };
    const reply = await askAssistant({
      messages: input.messages,
      lang,
      ctx: { orgId: session.orgId, branchId: session.branchId, role: session.role, lang },
    });
    return { ok: true, reply };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { ok: false, error: msg };
  }
}
