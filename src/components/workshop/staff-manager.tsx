"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, UserPlus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStaff, toggleStaffActive } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export interface StaffRow {
  id: string; name: string; role: string; phone: string | null; email: string | null; active: boolean; jobCount: number;
}

const ROLE_OPTIONS = [
  ["MECHANIC", "Mechanic"],
  ["COUNTER_STAFF", "Counter Staff"],
  ["MANAGER", "Manager"],
  ["SERVICE_ADVISOR", "Service Advisor"],
  ["INVENTORY", "Inventory"],
  ["MARKETING", "Marketing"],
] as const;

const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", SUPER_ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", COUNTER_STAFF: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  SERVICE_ADVISOR: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300", MECHANIC: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  INVENTORY: "bg-slate-100 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300", MARKETING: "bg-fuchsia-100 text-fuchsia-700",
};

export function StaffManager({ staff }: { staff: StaffRow[] }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("MECHANIC");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = () =>
    start(async () => {
      if (!name.trim()) { toast.error(t("toast.enter-staff-name", lang)); return; }
      const r = await createStaff({ name, role, phone: phone || undefined, email: email || undefined, password: password || undefined });
      if (r.authCreated) toast.success(tpl("toast.staff-login-created", lang, { email: r.authEmail ?? email }));
      else toast.success(t("toast.staff-added", lang));
      setName(""); setPhone(""); setEmail(""); setPassword(""); setAdding(false);
      router.refresh();
    });

  const toggle = (id: string, active: boolean, name: string) =>
    start(async () => {
      await toggleStaffActive(id);
      router.refresh();
      toast.success(active ? tpl("toast.staff-deactivated", lang, { name }) : tpl("toast.staff-activated", lang, { name }));
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add staff and manage who can access the workshop.</p>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" /> Add Staff</Button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Add team member</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali bin Abu" className="mt-1.5" /></div>
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v ?? "MECHANIC")}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 012-345 6789" className="mt-1.5" /></div>
            <div><Label>Email (optional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ali@dz.my" className="mt-1.5" /></div>
            <div><Label>{t("staff.password", lang)} <span className="text-muted-foreground">({t("staff.optional", lang)})</span></Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("staff.password-hint", lang)} className="mt-1.5" /></div>
          </div>
          <p className="text-xs text-muted-foreground">{t("staff.login-hint", lang)}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button disabled={pending || !name.trim()} onClick={submit}>{pending ? "Adding…" : "Add Staff"}</Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Jobs</th>
              <th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className={"border-b last:border-0 " + (s.active ? "" : "opacity-50")}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (ROLE_BADGE[s.role] ?? "bg-slate-100 text-slate-600 dark:text-slate-300")}>{s.role.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.phone ?? "—"}{s.email ? " · " + s.email : ""}</td>
                  <td className="px-4 py-3 tabular-nums">{s.jobCount}</td>
                  <td className="px-4 py-3">
                    <span className={"text-[11px] font-semibold " + (s.active ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400")}>{s.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.role !== "OWNER" && s.role !== "SUPER_ADMIN" && (
                      <button
                        onClick={() => toggle(s.id, s.active, s.name)}
                        disabled={pending}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted disabled:opacity-40"
                        title={s.active ? "Deactivate" : "Activate"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
