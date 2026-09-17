import {createInsertSchema,createUpdateSchema,createSelectSchema} from "drizzle-zod";
import {jobs} from "#/db/schema/index.js";


export const insertJobSchema=createInsertSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true })
export const updateJobSchema=createUpdateSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true })
export const selectJobSchema=createSelectSchema(jobs)
