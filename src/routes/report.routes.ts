import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { reportQuerySchema } from "../schemas/report.schemas.js"
import { getCategoryReport, getMonthlySummary } from "../controllers/report.controller.js"

/**
 * Report Routes
 * 
 * All routes are protected by authenticateToken middleware.
 * Report parameters are passed as query params: ?month=3&year=2026
 */

const router: Router = Router()

// Get monthly financial summary — total income, expenses and balance
router.get("/summary", authenticateToken, validateRequest({ query: reportQuerySchema }), getMonthlySummary)

// Get spending breakdown by category for a given month
router.get("/categories", authenticateToken, validateRequest({ query: reportQuerySchema }), getCategoryReport)

export default router