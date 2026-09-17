import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { contacts } from "#/db/schema/index.js";

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true })
export const updateContactSchema = createUpdateSchema(contacts).omit({ id: true, createdAt: true })
