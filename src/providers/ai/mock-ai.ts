import type { AiProvider } from "../types";

/** MockAIProvider — deterministic canned generation (no LLM in prototype). */
export class MockAIProvider implements AiProvider {
  readonly name = "mock-ai";

  async generate(prompt: string): Promise<string> {
    const p = prompt.toLowerCase();
    if (p.includes("sales script") || p.includes("recommend"))
      return "Abang, part ni dah lama tak tukar. Kalau tukar sekali dengan servis hari ni, memang lebih jimat dan selamat. Nak saya masukkan?";
    if (p.includes("reminder"))
      return "Hi, motosikal awak dah sampai masa servis seterusnya. Nak saya bookingkan slot?";
    if (p.includes("poster") || p.includes("marketing"))
      return "Servis musim ini — jaga enjin, jimat minyak. D&Z Smart Workshop.";
    if (p.includes("summary"))
      return "Pelanggan setia sejak 2019. Servis berkala konsisten, minyak hitam setiap 3,000 km.";
    return "D&Z Smart Workshop — servis berkualiti untuk motosikal anda.";
  }
}

export const aiProvider = new MockAIProvider();
