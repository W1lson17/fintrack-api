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
 * Returns both the paginated data and the total count for meta calculation.
 */
export const findTransactionsByUserId = async (userId: string, filters?: QueryTransactionsDto) => {
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 10
  const skip = (page - 1) * limit

  // Build where clause explicitly
  const where = {
    userId,
    ...(filters?.type && { type: filters.type }),
    ...(filters?.categoryId && { categoryId: filters.categoryId })
  }

  // Run both queries in parallel for efficiency
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: true },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ])

  return {
    data: transactions.map(t => ({ ...t, amount: formatDecimal(t.amount) })),
    total
  }
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
  const transaction = await prisma.transaction.delete({
    where: { id }
  })
  return { ...transaction, amount: formatDecimal(transaction.amount) }
}