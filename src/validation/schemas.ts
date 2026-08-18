import { z } from "zod";

// Server-side validation for all form inputs (§8 forms: React Hook Form + Zod).

export const createJobSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  motorcycleId: z.string().min(1, "Select a motorcycle"),
  mileage: z.coerce.number().int().min(0, "Mileage must be ≥ 0"),
  customerRequest: z.string().optional(),
  packageId: z.string().optional(),
  mechanicId: z.string().optional(),
  addonIds: z.array(z.string()).default([]),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

export const bookingSchema = z.object({
  motorcycleId: z.string().min(1, "Select a motorcycle"),
  serviceType: z.string().min(1, "Select a service"),
  date: z.string().min(1, "Pick a date"),
  timeSlot: z.string().min(1, "Pick a time"),
  notes: z.string().max(500).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const checklistItemSchema = z.object({
  result: z.enum(["PASS", "WARNING", "FAIL", "NA"]),
  note: z.string().max(1000).optional(),
});

export const findingSchema = z.object({
  title: z.string().min(1),
  severity: z.enum(["WARNING", "FAIL"]),
  note: z.string().max(1000).optional(),
  recommendedRepair: z.string().min(1, "Recommended repair is required"),
  priceSen: z.coerce.number().int().min(0),
});
export type FindingInput = z.infer<typeof findingSchema>;

export const milestoneSchema = z.object({
  mileage: z.coerce.number().int().min(0),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;
