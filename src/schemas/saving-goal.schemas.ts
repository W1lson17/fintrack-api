import z from "zod"

/**
 * Saving Goal Schemas
 * 
 * Zod schemas for validating saving goal-related requests.
 */

/**
 * Schema for creating a new saving goal
 * 
 * - targetAmount: must be positive — the goal amount to reach
 * - deadline: optional future date — if not provided, goal has no expiration
 */
export const createSavingGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  targetAmount: z.coerce.number().positive("Target amount must be a positive number"),
  // Optional deadline — must be a future date if provided
  deadline: z.coerce.date()
    .refine(date => date > new Date(), "Deadline must be a future date")
    .optional()
})

/**
 * Schema for updating saving goal progress
 * Used when the user adds money toward their goal
 */
export const updateSavingGoalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number")
})

/**
 * Schema for validating saving goal ID in route params
 * Prevents PostgreSQL errors from non-UUID strings
 */
export const savingGoalParamsSchema = z.object({
  id: z.uuid("Invalid saving goal ID")
})

export type CreateSavingGoalDto = z.infer<typeof createSavingGoalSchema>
export type UpdateSavingGoalDto = z.infer<typeof updateSavingGoalSchema>
export type SavingGoalParamsDto = z.infer<typeof savingGoalParamsSchema>