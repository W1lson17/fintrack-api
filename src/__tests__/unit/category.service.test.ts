/**
 * Category Service Unit Tests
 * 
 * Tests business logic of category service in isolation.
 * Repositories are mocked — no real database calls are made.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

jest.mock("../../repositories/category.repository.js", () => ({
  createCategory: jest.fn(),
  findCategoryByNameAndType: jest.fn(),
  findCategoriesByUserId: jest.fn(),
  findCategoryById: jest.fn(),
  deleteCategoryById: jest.fn()
}))

import {
  createCategoryService,
  getCategoriesService,
  getCategoryByIdService,
  deleteCategoryService
} from "../../services/category.service.js"
import {
  createCategory,
  findCategoryByNameAndType,
  findCategoriesByUserId,
  findCategoryById,
  deleteCategoryById
} from "../../repositories/category.repository.js"
import { AppError } from "../../lib/AppError.js"

const mockCategory = {
  id: "category-123",
  name: "Comida",
  type: "EXPENSE" as const,
  userId: "user-123",
  createdAt: new Date()
}

describe("CategoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createCategoryService", () => {
    const validData = { name: "Comida", type: "EXPENSE" as const }
    const userId = "user-123"

    it("should throw AppError if category already exists", async () => {
      // Arrange
      jest.mocked(findCategoryByNameAndType).mockResolvedValue(mockCategory)

      // Act & Assert
      await expect(createCategoryService(validData, userId)).rejects.toThrow(AppError)
      expect(createCategory).not.toHaveBeenCalled()
    })

    it("should create and return category on success", async () => {
      // Arrange
      jest.mocked(findCategoryByNameAndType).mockResolvedValue(null)
      jest.mocked(createCategory).mockResolvedValue(mockCategory)

      // Act
      const result = await createCategoryService(validData, userId)

      // Assert
      expect(result).toEqual(mockCategory)
      expect(createCategory).toHaveBeenCalledWith(validData, userId)
    })
  })

  describe("getCategoriesService", () => {
    it("should return all categories for a user", async () => {
      // Arrange
      jest.mocked(findCategoriesByUserId).mockResolvedValue([mockCategory])

      // Act
      const result = await getCategoriesService("user-123")

      // Assert
      expect(result).toEqual([mockCategory])
      expect(findCategoriesByUserId).toHaveBeenCalledWith("user-123")
    })
  })

  describe("getCategoryByIdService", () => {
    it("should throw AppError if category not found", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue(null)

      // Act & Assert
      await expect(getCategoryByIdService("category-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if category belongs to another user", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue({
        ...mockCategory,
        userId: "different-user"
      })

      // Act & Assert
      await expect(getCategoryByIdService("category-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should return category if found and owned by user", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue(mockCategory)

      // Act
      const result = await getCategoryByIdService("category-123", "user-123")

      // Assert
      expect(result).toEqual(mockCategory)
    })
  })

  describe("deleteCategoryService", () => {
    it("should throw AppError if category not found", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue(null)

      // Act & Assert
      await expect(deleteCategoryService("category-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if category belongs to another user", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue({
        ...mockCategory,
        userId: "different-user"
      })

      // Act & Assert
      await expect(deleteCategoryService("category-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should delete category if found and owned by user", async () => {
      // Arrange
      jest.mocked(findCategoryById).mockResolvedValue(mockCategory)
      jest.mocked(deleteCategoryById).mockResolvedValue(undefined as any)

      // Act
      await deleteCategoryService("category-123", "user-123")

      // Assert
      expect(deleteCategoryById).toHaveBeenCalledWith("category-123")
    })
  })
})