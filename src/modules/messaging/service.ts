// Messaging module — template rendering, opt-out guard, send-from-template.
import { db } from "@/lib/db";
import { messagingProvider } from "@/providers";

export type TemplateVars = Record<string, string | number | null | undefined>;

/** Replace {placeholder} tokens (MSG-005..011). */
export function renderTemplate(body: string, vars: TemplateVars): string {
  return body.replace(/\{(\w+)\}/g, (m, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? m : String(v);
  });
}

export const messagingModule = {
  /** Marketing opt-out guard (MSG-017): marketing sends are blocked for opted-out customers. */
  async canSendMarketing(customerId: string): Promise<boolean> {
    const consent = await db.customerConsent.findUnique({ where: { customerId } });
    if (!consent) return true; // no consent record → allow (transactional default)
    return consent.marketingOptIn;
  },

  /** Render a template and send to a customer, persisting to Message history (MSG-012..016). */
  async sendFromTemplate(input: {
    customerId: string; templateId: string; vars: TemplateVars;
    channel?: "WHATSAPP" | "SMS" | "EMAIL" | "APP"; isMarketing?: boolean; jobId?: string; referenceType?: string;
  }) {
    const [customer, template] = await Promise.all([
      db.customer.findUnique({ where: { id: input.customerId } }),
      db.messageTemplate.findUnique({ where: { id: input.templateId } }),
    ]);
    if (!customer || !template) throw new Error("Customer or template not found");
    if (input.isMarketing && !(await this.canSendMarketing(customer.id))) {
      throw new Error("CUSTOMER_OPTED_OUT");
    }
    const body = renderTemplate(template.body, { name: customer.name, ...input.vars });
    const channel = input.channel ?? (template.channel as "WHATSAPP" | "SMS" | "EMAIL" | "APP") ?? "WHATSAPP";
    let result;
    try {
      result = await messagingProvider.send(customer.phone ?? customer.name, body);
    } catch (e) {
      // MSG-020: API failures logged as FAILED message
      result = { ok: false, externalId: null, status: "FAILED" as const };
    }
    const message = await db.message.create({
      data: {
        organisationId: customer.organisationId,
        branchId: customer.branchId,
        customerId: customer.id,
        jobId: input.jobId ?? null,
        direction: "OUT",
        channel,
        body,
        status: result.status,
        referenceType: input.referenceType ?? template.name,
      },
    });
    return { message, sent: result.ok, body };
  },
};
