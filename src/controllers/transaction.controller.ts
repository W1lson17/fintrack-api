import type { Request, Response } from "express"
import * as transactionService from "../services/transaction.service.js"
import type { CreateTransactionDto, TransactionParamsDto, QueryTransactionsDto } from "../schemas/transaction.schemas.js"

/**
 * Transaction Controllers
 * 
 * Handles HTTP requests for transaction management.
 * All endpoints require authentication — userId is extracted from JWT via req.user
 */

/**
 * POST /api/transactions
 * Creates a new transaction for the authenticated user
 */
export const createTransaction = async (
  req: Request<object, object, CreateTransactionDto>,
  res: Response
) => {
  // Extract userId from JWT token — set by authenticateToken middleware
  const userId = req.user!.id
  const result = await transactionService.createTransactionService(req.body, userId)
  res.status(201).json(result)
}

/**
 * GET /api/transactions
 * Returns a paginated list of transactions for the authenticated user.
 * Accepts optional query params: type, categoryId, page, limit.
 * All params are validated and injected by validateRequest middleware via req.validated.
 */
export const getTransactions = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const filters = req.validated?.query as QueryTransactionsDto

  const { data, total } = await transactionService.getTransactionsService(userId, filters)

  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 10

  res.status(200).json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

/**
 * GET /api/transactions/:id
 * Returns a single transaction by ID — validates ownership before returning
 */
export const getTransactionById = async (
  req: Request<TransactionParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  const result = await transactionService.getTransactionByIdService(req.params.id, userId)
  res.status(200).json(result)
}

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction by ID — validates ownership before deleting
 * Returns 204 No Content on success
 */
export const deleteTransaction = async (
  req: Request<TransactionParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  await transactionService.deleteTransactionService(req.params.id, userId)
  // 204 No Content — successful deletion returns no body
  res.status(204).send()
}