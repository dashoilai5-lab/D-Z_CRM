"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateRiderProfile } from "@/actions/rider-profile";

export interface RiderProfileInitial {
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
}

const GENDERS = ["", "M", "F"];

/** Rider 个人资料编辑表单（Settings → Profile）。 */
export function ProfileForm({ initial }: { customerId?: string; initial: RiderProfileInitial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [gender, setGender] = useState(initial.gender);
  const [address, setAddress] = useState(initial.address);

  const submit = () =>
    start(async () => {
      const r = await updateRiderProfile({ name, phone, email, gender, address });
      if (r.ok) {
        toast.success("Profile updated");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });

  return (
    <div className="space-y-3">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Your full name" />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" placeholder="e.g. 012-345 6789" inputMode="tel" />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="you@email.com" />
      </div>
      <div>
        <Label>Gender</Label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {GENDERS.map((g) => (
            <option key={g || "unset"} value={g}>{g ? g : "Prefer not to say"}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5" placeholder="Home address" />
      </div>
      <Button className="w-full" disabled={pending || !name.trim()} onClick={submit}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
