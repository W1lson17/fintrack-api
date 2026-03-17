import z from "zod"

// Valid transaction types used across the application
export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  type: z.enum(TRANSACTION_TYPES, { message: "Type must be INCOME or EXPENSE" })
})

// Schema for validating category ID in route params
export const categoryParamsSchema = z.object({
  id: z.uuid("Invalid category ID")
})

export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type CategoryParamsDto = z.infer<typeof categoryParamsSchema>