import { Router } from "express"
import { validateRequest } from "../middlewares/validateRequest.js"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { createTransactionSchema, transactionParamsSchema } from "../schemas/transaction.schemas.js"
import { createTransaction, deleteTransaction, getTransactionById, getTransactions } from "../controllers/transaction.controller.js"

/**
 * Transaction Routes
 * 
 * All routes are protected by authenticateToken middleware.
 * Request data is validated with Zod schemas before reaching controllers.
 */

const router: Router = Router()

// Create a new transaction — validates request body
router.post("/", authenticateToken, validateRequest({ body: createTransactionSchema }), createTransaction)

// Get all transactions for the authenticated user — supports optional query filters
router.get("/", authenticateToken, getTransactions)

// Get a single transaction by ID — validates UUID format in params
router.get("/:id", authenticateToken, validateRequest({ params: transactionParamsSchema }), getTransactionById)

// Delete a transaction by ID — validates UUID format in params
router.delete("/:id", authenticateToken, validateRequest({ params: transactionParamsSchema }), deleteTransaction)

export default router