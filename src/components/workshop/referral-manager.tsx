"use client";

import { useRouter } from "next/navigation";
import { qualifyReferralAction } from "@/actions/loyalty";

export function ReferralManager({ referrals }: { referrals: { id: string; code: string; status: string; referrer: string; referred: string; createdAt: Date }[] }) {
  const router = useRouter();
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <h2 className="font-semibold text-sm px-4 pt-3 pb-2">Referrals ({referrals.length})</h2>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr><th className="px-4 py-2 font-medium">Code</th><th className="px-4 py-2 font-medium">Referrer</th><th className="px-4 py-2 font-medium">Referred</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium">Created</th><th className="px-4 py-2"></th></tr>
        </thead>
        <tbody>
          {referrals.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2.5 font-mono text-xs">{r.code}</td>
              <td className="px-4 py-2.5">{r.referrer}</td>
              <td className="px-4 py-2.5 text-xs">{r.referred}</td>
              <td className="px-4 py-2.5 text-xs">{r.status}</td>
              <td className="px-4 py-2.5 text-xs">{r.createdAt.toISOString().slice(0, 10)}</td>
              <td className="px-4 py-2.5 text-right">
                {r.status === "PENDING" && (
                  <button className="text-xs text-primary hover:underline" onClick={async () => { await qualifyReferralAction(r.id); router.refresh(); }}>Qualify → reward</button>
                )}
              </td>
            </tr>
          ))}
          {referrals.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No referrals yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
