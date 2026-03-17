import { prisma } from "../lib/prisma.js"
import { formatDecimal } from "../lib/formatters.js"
import type { CreateTransactionDto, QueryTransactionsDto } from "../schemas/transaction.schemas.js"

/**
 * Transaction Repository
 * 
 * Handles all database operations for transactions.
 * Uses Prisma ORM for type-safe database access.
 */

/**
 * Creates a new transaction associated with a user
 */
export const createTransaction = async (data: CreateTransactionDto, userId: string) => {
  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      userId,
      // Default to current date if not provided
      date: data.date ?? new Date()
    }
  })
  return { ...transaction, amount: formatDecimal(transaction.amount) }
}

/**
 * Retrieves all transactions for a user with optional filters
 * Supports filtering by transaction type and/or category
 */
export const findTransactionsByUserId = async (userId: string, filters?: QueryTransactionsDto) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      // Only apply filters if provided
      ...(filters?.type && { type: filters.type }),
      ...(filters?.categoryId && { categoryId: filters.categoryId })
    },
    orderBy: { date: "desc" },
    // Include category details in the response
    include: { category: true }
  })
  return transactions.map(t => ({ ...t, amount: formatDecimal(t.amount) }))
}

/**
 * Finds a single transaction by its ID
 */
export const findTransactionById = async (id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true }
  })
  // Return null if transaction not found — service handles the not found error
  if (!transaction) return null
  return { ...transaction, amount: formatDecimal(transaction.amount) }
}

/**
 * Deletes a transaction by its ID
 */
export const deleteTransactionById = async (id: string) => {
  return prisma.transaction.delete({
    where: { id }
  })
}