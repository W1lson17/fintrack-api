import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import { findCategoryById } from "../repositories/category.repository.js"
import {
  createTransaction,
  deleteTransactionById,
  findTransactionById,
  findTransactionsByUserId
} from "../repositories/transaction.repository.js"
import type { CreateTransactionDto, QueryTransactionsDto } from "../schemas/transaction.schemas.js"

/**
 * Transaction Service
 * 
 * Business logic for transaction management.
 * Handles ownership verification and category validation before database operations.
 */

/**
 * Creates a new transaction for the authenticated user
 * Validates that the category exists and belongs to the user before creating
 */
export const createTransactionService = async (data: CreateTransactionDto, userId: string) => {
  // Verify category exists and belongs to the user
  const category = await findCategoryById(data.categoryId)
  if (!category) throw new AppError("Category not found", 404, ERROR_CODES.CATEGORY_NOT_FOUND)
  if (category.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return createTransaction(data, userId)
}

/**
 * Retrieves all transactions for a user with optional filters
 * Pagination params are optional — defaults applied at repository level.
 */
export const getTransactionsService = async (userId: string, filters?: QueryTransactionsDto) => {
  return findTransactionsByUserId(userId, filters)
}

/**
 * Retrieves a single transaction by ID
 * Validates ownership before returning the transaction
 */
export const getTransactionByIdService = async (id: string, userId: string) => {
  const transaction = await findTransactionById(id)
  if (!transaction) throw new AppError("Transaction not found", 404, ERROR_CODES.TRANSACTION_NOT_FOUND)

  // Prevent users from accessing other users' transactions
  if (transaction.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return transaction
}

/**
 * Deletes a transaction by ID
 * Validates ownership before deleting
 */
export const deleteTransactionService = async (id: string, userId: string) => {
  const transaction = await findTransactionById(id)
  if (!transaction) throw new AppError("Transaction not found", 404, ERROR_CODES.TRANSACTION_NOT_FOUND)

  // Prevent users from deleting other users' transactions
  if (transaction.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return deleteTransactionById(id)
}