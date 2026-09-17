import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { visitors } from "#/db/schema/index.js";

export const insertVisitorsSchema = createInsertSchema(visitors).omit({ id: true, createdAt: true, updatedAt: true });
export const updateVisitorsSchema = createUpdateSchema(visitors).omit({ id: true, createdAt: true, updatedAt: true });
