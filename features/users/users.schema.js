import { z } from "zod";

const roleSchema = z.enum(["editor", "author", "visitor"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role: roleSchema.default("visitor"),
  avatar: z.uuid().nullable().optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    email: z.email().transform((value) => value.toLowerCase()).optional(),
    password: z.string().min(8).max(128).optional(),
    role: roleSchema.optional(),
    avatar: z.uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const userIdSchema = z.object({ id: z.uuid("Invalid user ID") });
