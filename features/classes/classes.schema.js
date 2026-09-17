import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { classes } from "../../db/schema/index.js";

export const createClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true, updatedAt: true });
export const updateClassSchema = createUpdateSchema(classes).omit({ id: true, createdAt: true, updatedAt: true });
