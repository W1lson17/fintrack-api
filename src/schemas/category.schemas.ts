import z from "zod"
import { TRANSACTION_TYPES } from "../lib/constants.js"

/**
 * Category Schemas
 * 
 * Zod schemas for validating category-related requests.
 * Transaction types are imported from shared constants to avoid duplication.
 */

/**
 * Schema for creating a new category
 * 
 * - name: required, max 255 characters
 * - type: must be INCOME or EXPENSE — imported from shared constants
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  type: z.enum(TRANSACTION_TYPES, { message: "Type must be INCOME or EXPENSE" })
})

/**
 * Schema for validating category ID in route params
 * Prevents PostgreSQL errors from non-UUID strings
 */
export const categoryParamsSchema = z.object({
  id: z.uuid("Invalid category ID")
})

export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type CategoryParamsDto = z.infer<typeof categoryParamsSchema>