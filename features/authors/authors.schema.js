import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { authors } from "./authors.db.js";

export const insertAuthorSchema = createInsertSchema(authors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateAuthorSchema = createUpdateSchema(authors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
