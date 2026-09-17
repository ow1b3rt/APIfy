import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { notices } from "../../db/schema/index.js";

export const createNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateNoticeSchema = createUpdateSchema(notices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
