import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { successProfiles } from '../../db/schema/index.js'

export const insertSuccessProfileSchema = createInsertSchema(successProfiles).omit({ id: true, createdAt: true, updatedAt: true })
export const updateSuccessProfileSchema = createUpdateSchema(successProfiles).omit({ id: true, createdAt: true, updatedAt: true })
