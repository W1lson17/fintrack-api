/**
 * Saving Goal Service Unit Tests
 * 
 * Tests business logic of saving goal service in isolation.
 * Repositories are mocked — no real database calls are made.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

jest.mock("../../repositories/saving-goal.repository.js", () => ({
  createSavingGoal: jest.fn(),
  findSavingGoalsByUserId: jest.fn(),
  findSavingGoalById: jest.fn(),
  updateSavingGoalAmount: jest.fn(),
  deleteSavingGoalById: jest.fn()
}))

import {
  createSavingGoalService,
  getSavingGoalsService,
  getSavingGoalByIdService,
  updateSavingGoalService,
  deleteSavingGoalService
} from "../../services/saving-goal.service.js"
import {
  createSavingGoal,
  findSavingGoalsByUserId,
  findSavingGoalById,
  updateSavingGoalAmount,
  deleteSavingGoalById
} from "../../repositories/saving-goal.repository.js"
import { AppError } from "../../lib/AppError.js"

// number types — repository applies formatDecimal before returning
const mockSavingGoal = {
  id: "goal-123",
  name: "Vacaciones",
  targetAmount: 10000,
  currentAmount: 0,
  deadline: new Date("2026-12-31"),
  userId: "user-123",
  createdAt: new Date()
}

describe("SavingGoalService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createSavingGoalService", () => {
    const validData = {
      name: "Vacaciones",
      targetAmount: 10000,
      deadline: new Date("2026-12-31")
    }

    it("should create and return saving goal on success", async () => {
      // Arrange
      jest.mocked(createSavingGoal).mockResolvedValue(mockSavingGoal)

      // Act
      const result = await createSavingGoalService(validData, "user-123")

      // Assert
      expect(result).toEqual(mockSavingGoal)
      expect(createSavingGoal).toHaveBeenCalledWith(validData, "user-123")
    })
  })

  describe("getSavingGoalsService", () => {
    it("should return all saving goals for a user", async () => {
      // Arrange
      jest.mocked(findSavingGoalsByUserId).mockResolvedValue([mockSavingGoal])

      // Act
      const result = await getSavingGoalsService("user-123")

      // Assert
      expect(result).toEqual([mockSavingGoal])
      expect(findSavingGoalsByUserId).toHaveBeenCalledWith("user-123")
    })
  })

  describe("getSavingGoalByIdService", () => {
    it("should throw AppError if saving goal not found", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(null)

      // Act & Assert
      await expect(getSavingGoalByIdService("goal-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if saving goal belongs to another user", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue({
        ...mockSavingGoal,
        userId: "different-user"
      })

      // Act & Assert
      await expect(getSavingGoalByIdService("goal-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should return saving goal if found and owned by user", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(mockSavingGoal)

      // Act
      const result = await getSavingGoalByIdService("goal-123", "user-123")

      // Assert
      expect(result).toEqual(mockSavingGoal)
    })
  })

  describe("updateSavingGoalService", () => {
    it("should throw AppError if saving goal not found", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(null)

      // Act & Assert
      await expect(updateSavingGoalService("goal-123", { amount: 500 }, "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if saving goal belongs to another user", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue({
        ...mockSavingGoal,
        userId: "different-user"
      })

      // Act & Assert
      await expect(updateSavingGoalService("goal-123", { amount: 500 }, "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if amount exceeds target", async () => {
      // Arrange — currentAmount(0) + amount(15000) > targetAmount(10000)
      jest.mocked(findSavingGoalById).mockResolvedValue(mockSavingGoal)

      // Act & Assert
      await expect(updateSavingGoalService("goal-123", { amount: 15000 }, "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should update and return saving goal on success", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(mockSavingGoal)
      jest.mocked(updateSavingGoalAmount).mockResolvedValue({
        ...mockSavingGoal,
        currentAmount: 500
      })

      // Act
      const result = await updateSavingGoalService("goal-123", { amount: 500 }, "user-123")

      // Assert
      expect(result.currentAmount).toBe(500)
      expect(updateSavingGoalAmount).toHaveBeenCalledWith("goal-123", { amount: 500 })
    })
  })

  describe("deleteSavingGoalService", () => {
    it("should throw AppError if saving goal not found", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(null)

      // Act & Assert
      await expect(deleteSavingGoalService("goal-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if saving goal belongs to another user", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue({
        ...mockSavingGoal,
        userId: "different-user"
      })

      // Act & Assert
      await expect(deleteSavingGoalService("goal-123", "user-123"))
        .rejects.toThrow(AppError)
    })

    it("should delete saving goal if found and owned by user", async () => {
      // Arrange
      jest.mocked(findSavingGoalById).mockResolvedValue(mockSavingGoal)
      jest.mocked(deleteSavingGoalById).mockResolvedValue(mockSavingGoal)

      // Act
      await deleteSavingGoalService("goal-123", "user-123")

      // Assert
      expect(deleteSavingGoalById).toHaveBeenCalledWith("goal-123")
    })
  })
})