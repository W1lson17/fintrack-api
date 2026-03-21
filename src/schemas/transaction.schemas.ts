import z from "zod"
import { TRANSACTION_TYPES } from "../lib/constants.js"
import { paginationSchema } from "./pagination.schemas.js"

/**
 * Schema for creating a new transaction
 * 
 * - amount: coerced from string to number to handle form inputs
 * - date: optional — defaults to current date if not provided
 */
export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  type: z.enum(TRANSACTION_TYPES, { message: "Type must be INCOME or EXPENSE" }),
  categoryId: z.uuid("Invalid category ID"),
  description: z.string().max(255, "Description must be at most 255 characters").optional(),
  // Optional date — if not provided, the service will use current date
  date: z.coerce.date().optional()
})

/**
 * Schema for validating transaction ID in route params
 * Prevents PostgreSQL errors from non-UUID strings
 */
export const transactionParamsSchema = z.object({
  id: z.uuid("Invalid transaction ID")
})

/**
 * Schema for GET /transactions query parameters.
 *
 * Merges existing filters with pagination:
 * - type:       optional filter by INCOME or EXPENSE
 * - categoryId: optional filter by category UUID
 * - page:       page number, defaults to 1
 * - limit:      records per page, defaults to 10, max 100
 */
export const queryTransactionsSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { message: "Type must be INCOME or EXPENSE" }).optional(),
  categoryId: z.uuid("Invalid category ID").optional()
}).extend(paginationSchema.shape)

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>
export type TransactionParamsDto = z.infer<typeof transactionParamsSchema>
export type QueryTransactionsDto = z.infer<typeof queryTransactionsSchema>