/**
 * Report Service Unit Tests
 * 
 * Tests business logic of report service in isolation.
 * Prisma client is mocked — no real database calls are made.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

jest.mock("../../lib/prisma.js", () => ({
  prisma: {
    transaction: {
      aggregate: jest.fn(),
      findMany: jest.fn()
    }
  }
}))

import { getMonthlySummaryService, getCategoryReportService } from "../../services/report.service.js"
import { prisma } from "../../lib/prisma.js"

describe("ReportService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getMonthlySummaryService", () => {
    it("should return summary with zeros when no transactions exist", async () => {
      // Arrange — simulate no transactions
      jest.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: null } } as any)
        .mockResolvedValueOnce({ _sum: { amount: null } } as any)

      // Act
      const result = await getMonthlySummaryService("user-123", { month: 3, year: 2026 })

      // Assert
      expect(result).toEqual({
        month: 3,
        year: 2026,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
      })
    })

    it("should return correct summary with transactions", async () => {
      // Arrange
      jest.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 5000 } } as any)
        .mockResolvedValueOnce({ _sum: { amount: 2000 } } as any)

      // Act
      const result = await getMonthlySummaryService("user-123", { month: 3, year: 2026 })

      // Assert
      expect(result.totalIncome).toBe(5000)
      expect(result.totalExpenses).toBe(2000)
      expect(result.balance).toBe(3000)
    })
  })

  describe("getCategoryReportService", () => {
    it("should return empty array when no transactions exist", async () => {
      // Arrange
      jest.mocked(prisma.transaction.findMany).mockResolvedValue([])

      // Act
      const result = await getCategoryReportService("user-123", { month: 3, year: 2026 })

      // Assert
      expect(result).toEqual([])
    })

    it("should return spending grouped by category sorted by highest spending", async () => {
      // Arrange
      jest.mocked(prisma.transaction.findMany).mockResolvedValue([
        {
          id: "t1",
          amount: 1500,
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Comida", type: "EXPENSE", userId: "user-123", createdAt: new Date() }
        },
        {
          id: "t2",
          amount: 3000,
          categoryId: "cat-2",
          category: { id: "cat-2", name: "Renta", type: "EXPENSE", userId: "user-123", createdAt: new Date() }
        }
      ] as any)

      // Act
      const result = await getCategoryReportService("user-123", { month: 3, year: 2026 })

      // Assert — sorted by highest spending
      expect(result[0].categoryName).toBe("Renta")
      expect(result[0].total).toBe(3000)
      expect(result[1].categoryName).toBe("Comida")
      expect(result[1].total).toBe(1500)
    })
  })
})