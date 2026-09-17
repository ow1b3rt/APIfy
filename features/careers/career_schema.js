import {createInsertSchema, createUpdateSchema, createSelectSchema} from 'drizzle-zod';
import {careers} from "./careers.db.js";

export const insertCareerSchema= createInsertSchema(careers).omit({ id: true, createdAt: true, updatedAt: true })
export const updateCareerSchema= createUpdateSchema(careers).omit({ id: true, createdAt: true, updatedAt: true, resume: true, job_id: true })
export const selectCareerSchema= createSelectSchema(careers)

