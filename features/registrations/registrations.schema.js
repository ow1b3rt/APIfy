import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { registrations } from "#/db/schema/index.js";

export const insertRegistrationsSchema = createInsertSchema(registrations);

export const submitRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format").transform((value) => value.toLowerCase()),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().optional(),
  gpa: z.coerce.number().min(0).max(4).optional(),

  location: z.string().optional(),
  qualification: z.enum(["SEE", "+2", "Bachelor's", "Master's"]).optional(),
  class: z.string().min(1, "Class is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  classType: z.enum(["physical", "online", "hybrid", "not_sure"]).optional(),
  additionalInfo: z.string().optional(),
});
