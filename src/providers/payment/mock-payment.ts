import type { PaymentProvider } from "../types";

/** MockPaymentProvider — prototype auto-succeeds (no real payment processing, §48). */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock-payment";

  async charge(_amountSen: number, _reference: string, _method: string) {
    await new Promise((r) => setTimeout(r, 80));
    return { ok: true, paidAt: new Date() };
  }
}

export const paymentProvider = new MockPaymentProvider();
