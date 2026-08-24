import Link from "next/link";
import { Bike } from "lucide-react";

/** 未登录顾客访问 rider 页时的登录引导（生产模式）。 */
export default function RiderSignInPrompt() {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Bike className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold">Sign in to view your bikes</h2>
      <p className="text-sm text-muted-foreground">Log in to access your bookings, service history and more.</p>
      <Link href="/login" className="inline-block rounded-md bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90">
        Sign in
      </Link>
    </div>
  );
}
