import z from "zod"

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  type: z.enum(TRANSACTION_TYPES, { message: "Type must be INCOME or EXPENSE" })
})

export const categoryParamsSchema = z.object({
  id: z.uuid("Invalid category ID")
})

export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type CategoryParamsDto = z.infer<typeof categoryParamsSchema>