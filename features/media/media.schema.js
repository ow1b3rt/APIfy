import { createInsertSchema } from "drizzle-zod";
import { media } from "../../db/schema/index.js";

export const createMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
