/**
 * Transaction Service Unit Tests
 * 
 * Tests business logic of transaction service in isolation.
 * Repositories are mocked — no real database calls are made.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

vi.mock("../../repositories/transaction.repository.js", () => ({
  createTransaction: vi.fn(),
  findTransactionsByUserId: vi.fn(),
  findTransactionById: vi.fn(),
  deleteTransactionById: vi.fn()
}))

vi.mock("../../repositories/category.repository.js", () => ({
  findCategoryById: vi.fn()
}))

import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  deleteTransactionService
} from "../../services/transaction.service.js"
import {
  createTransaction,
  findTransactionsByUserId,
  findTransactionById,
  deleteTransactionById
} from "../../repositories/transaction.repository.js"
import { findCategoryById } from "../../repositories/category.repository.js"
import { AppError } from "../../lib/AppError.js"

const mockCategory = {
  id: "category-123",
  name: "Comida",
  type: "EXPENSE" as const,
  userId: "user-123",
  createdAt: new Date()
}

const mockTransaction = {
  id: "transaction-123",
  amount: 500, // number — repository already applies formatDecimal
  description: "Supermercado",
  type: "EXPENSE" as const,
  date: new Date(),
  categoryId: "category-123",
  userId: "user-123",
  createdAt: new Date(),
  category: mockCategory
}

describe("TransactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createTransactionService", () => {
    const validData = {
      amount: 500,
      type: "EXPENSE" as const,
      categoryId: "category-123",
      description: "Supermercado"
    }
    const userId = "user-123"

    it("should throw AppError if category not found", async () => {
      // Arrange
      vi.mocked(findCategoryById).mockResolvedValue(null)

      // Act & Assert
      await expect(createTransactionService(validData, userId))
        .rejects.toThrow(AppError)
      expect(createTransaction).not.toHaveBeenCalled()
    })

    it("should throw AppError if category belongs to another user", async () => {
      // Arrange
      vi.mocked(findCategoryById).mockResolvedValue({
        ...mockCategory,
        userId: "different-user"
      })

      // Act & Assert
      await expect(createTransactionService(validData, userId))
        .rejects.toThrow(AppError)
      expect(createTransaction).not.toHaveBeenCalled()
    })

    it("should create and return transaction on success", async () => {
      // Arrange
      vi.mocked(findCategoryById).mockResolvedValue(mockCategory)
      vi.mocked(createTransaction).mockResolvedValue(mockTransaction)

      // Act
      const result = await createTransactionService(validData, userId)

      // Assert
      expect(result).toEqual(mockTransaction)
      expect(createTransaction).toHaveBeenCalledWith(validData, userId)
    })
  })

  describe("getTransactionsService", () => {
    it("should return all transactions for a user", async () => {
      // Arrange — mock returns shape: { data, total }
      vi.mocked(findTransactionsByUserId).mockResolvedValue({
        data: [mockTransaction],
        total: 1
      })

      // Act
      const result = await getTransactionsService("user-123")

      // Assert
      expect(result).toEqual({ data: [mockTransaction], total: 1 })
      expect(findTransactionsByUserId).toHaveBeenCalledWith("user-123", undefined)
    })
  })

  describe("getTransactionByIdService", () => {
    it("should throw AppError if transaction not found", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue(null)

      // Act & Assert
      await expect(getTransactionByIdService("transaction-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if transaction belongs to another user", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue({
        ...mockTransaction,
        userId: "different-user"
      })

      // Act & Assert
      await expect(getTransactionByIdService("transaction-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should return transaction if found and owned by user", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue(mockTransaction)

      // Act
      const result = await getTransactionByIdService("transaction-123", "user-123")

      // Assert
      expect(result).toEqual(mockTransaction)
    })
  })

  describe("deleteTransactionService", () => {
    it("should throw AppError if transaction not found", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue(null)

      // Act & Assert
      await expect(deleteTransactionService("transaction-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if transaction belongs to another user", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue({
        ...mockTransaction,
        userId: "different-user"
      })

      // Act & Assert
      await expect(deleteTransactionService("transaction-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should delete transaction if found and owned by user", async () => {
      // Arrange
      vi.mocked(findTransactionById).mockResolvedValue(mockTransaction)
      vi.mocked(deleteTransactionById).mockResolvedValue(mockTransaction)

      // Act
      await deleteTransactionService("transaction-123", "user-123")

      // Assert
      expect(deleteTransactionById).toHaveBeenCalledWith("transaction-123")
    })
  })
})