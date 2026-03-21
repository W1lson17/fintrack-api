import { prisma } from "../lib/prisma.js"
import { formatDecimal } from "../lib/formatters.js"
import { ReportQueryDto } from "../schemas/report.schemas.js"

/**
 * Report Service
 * 
 * Generates financial reports by querying transaction data directly.
 * No repository layer — queries are report-specific and not reused elsewhere.
 */

/**
 * Calculates date range for a given month and year
 * Helper to avoid code duplication between report functions
 */
const getMonthDateRange = (month: number, year: number) => ({
  // First day of the month at 00:00:00
  startDate: new Date(year, month - 1, 1),
  // Last day of the month at 23:59:59
  endDate: new Date(year, month, 0, 23, 59, 59)
})

/**
 * Generates a monthly financial summary for a user
 * Returns total income, total expenses and balance for the given month
 */
export const getMonthlySummaryService = async (userId: string, query: ReportQueryDto) => {
  const { startDate, endDate } = getMonthDateRange(query.month, query.year)

  // Run both queries in parallel for better performance
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    })
  ])

  const totalIncome = formatDecimal(incomeResult._sum.amount ?? 0)
  const totalExpenses = formatDecimal(expenseResult._sum.amount ?? 0)

  return {
    month: query.month,
    year: query.year,
    totalIncome,
    totalExpenses,
    // Positive balance means more income than expenses
    balance: totalIncome - totalExpenses
  }
}

/**
 * Generates a spending report grouped by category for a given month
 * Returns total amount spent per category ordered by highest spending
 */
export const getCategoryReportService = async (userId: string, query: ReportQueryDto) => {
  const { startDate, endDate } = getMonthDateRange(query.month, query.year)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate }
    },
    include: { category: true }
  })

  // Group transactions by category and sum amounts
  const categoryMap = new Map<string, { categoryName: string; total: number }>()

  for (const transaction of transactions) {
    const categoryId = transaction.categoryId
    const existing = categoryMap.get(categoryId)

    if (existing) {
      existing.total += formatDecimal(transaction.amount)
    } else {
      categoryMap.set(categoryId, {
        categoryName: transaction.category.name,
        total: formatDecimal(transaction.amount)
      })
    }
  }

  // Convert map to array and sort by highest spending
  return Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
}