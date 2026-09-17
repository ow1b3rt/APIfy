import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { events } from "#/db/schema/index.js";

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export const updateEventSchema = createUpdateSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
