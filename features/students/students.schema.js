import { z } from "zod";

const studentFields = {
  name: z.string().trim().min(1).max(255),
  email: z.email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(20),
  dob: z.string().trim().max(50).nullable().optional(),
  location: z.string().trim().max(255).nullable().optional(),
  gpa: z.coerce.number().min(0).max(4).default(0),
  qualification: z.enum(["SEE", "+2", "Bachelor's", "Master's"]).nullable().optional(),
};

export const studentCreateSchema = z.object({
  ...studentFields,
  classes: z.array(z.uuid()).default([]),
});

export const updateStudentSchema = z
  .object({
    ...Object.fromEntries(Object.entries(studentFields).map(([key, value]) => [key, value.optional()])),
    classes: z.array(z.uuid()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");
