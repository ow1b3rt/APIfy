import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { partners } from "../../db/schema/index.js";

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePartnerSchema = createUpdateSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
