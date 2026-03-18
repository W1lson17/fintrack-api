import type { Request, Response } from "express"
import type { ReportQueryDto } from "../schemas/report.schemas.js"
import * as reportsService from "../services/report.service.js"

/**
 * Report Controllers
 * 
 * Handles HTTP requests for financial report generation.
 * All endpoints require authentication — userId is extracted from JWT via req.user
 * Report parameters are passed as query params: ?month=3&year=2026
 */

/**
 * GET /api/reports/summary
 * Returns monthly financial summary — total income, expenses and balance
 */
export const getMonthlySummary = async (req: Request, res: Response) => {
  const userId = req.user!.id
  // Query params accessed via req.validated — populated by validateRequest middleware
  const query = req.validated?.query as ReportQueryDto
  const result = await reportsService.getMonthlySummaryService(userId, query)
  res.status(200).json(result)
}

/**
 * GET /api/reports/categories
 * Returns spending breakdown by category for a given month
 */
export const getCategoryReport = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const query = req.validated?.query as ReportQueryDto
  const result = await reportsService.getCategoryReportService(userId, query)
  res.status(200).json(result)
}