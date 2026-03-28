/**
 * User Service Unit Tests
 *
 * Tests business logic of user service in isolation.
 * Repositories are mocked — no real database calls are made.
 *
 * Pattern: AAA (Arrange, Act, Assert)
 */

// Mock repositories BEFORE imports — vi.mock is hoisted to top of file
vi.mock("../../repositories/user.repository.js", () => ({
  findUserById: vi.fn(),
  updateUserName: vi.fn(),
  findUserPasswordById: vi.fn(),
  updateUserPassword: vi.fn(),
  deleteUserById: vi.fn()
}))

vi.mock("../../repositories/auth.repository.js", () => ({
  deleteAllRefreshTokensByUserId: vi.fn()
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}))

import {
  getProfileService,
  updateNameService,
  changePasswordService,
  deleteAccountService
} from "../../services/user.service.js"
import {
  findUserById,
  updateUserName,
  findUserPasswordById,
  updateUserPassword,
  deleteUserById
} from "../../repositories/user.repository.js"
import { deleteAllRefreshTokensByUserId } from "../../repositories/auth.repository.js"
import bcrypt from "bcryptjs"
import { AppError } from "../../lib/AppError.js"

const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@test.com",
  createdAt: new Date()
}

const mockUserPassword = {
  password: "hashed-password"
}

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getProfileService", () => {
    it("should return user profile if found", async () => {
      // Arrange
      vi.mocked(findUserById).mockResolvedValue(mockUser)

      // Act
      const result = await getProfileService("user-123")

      // Assert
      expect(result).toEqual(mockUser)
      expect(findUserById).toHaveBeenCalledWith("user-123")
    })

    it("should throw AppError if user not found", async () => {
      // Arrange
      vi.mocked(findUserById).mockResolvedValue(null)

      // Act & Assert
      await expect(getProfileService("user-123")).rejects.toThrow(AppError)
    })
  })

  describe("updateNameService", () => {
    const validData = { name: "New Name" }

    it("should update and return user if found", async () => {
      // Arrange
      const updatedUser = { ...mockUser, name: "New Name" }
      vi.mocked(findUserById).mockResolvedValue(mockUser)
      vi.mocked(updateUserName).mockResolvedValue(updatedUser)

      // Act
      const result = await updateNameService("user-123", validData)

      // Assert
      expect(result).toEqual(updatedUser)
      expect(updateUserName).toHaveBeenCalledWith("user-123", "New Name")
    })

    it("should throw AppError if user not found", async () => {
      // Arrange
      vi.mocked(findUserById).mockResolvedValue(null)

      // Act & Assert
      await expect(updateNameService("user-123", validData)).rejects.toThrow(AppError)
      expect(updateUserName).not.toHaveBeenCalled()
    })
  })

  describe("changePasswordService", () => {
    const validData = { currentPassword: "OldPass1!", newPassword: "NewPass1!" }

    it("should change password if current password is valid", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(mockUserPassword)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-password" as never)

      // Act
      await changePasswordService("user-123", validData)

      // Assert
      expect(updateUserPassword).toHaveBeenCalledWith("user-123", "new-hashed-password")
    })

    it("should throw AppError if user not found", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(null)

      // Act & Assert
      await expect(changePasswordService("user-123", validData)).rejects.toThrow(AppError)
      expect(updateUserPassword).not.toHaveBeenCalled()
    })

    it("should throw AppError if current password is incorrect", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(mockUserPassword)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      // Act & Assert
      await expect(changePasswordService("user-123", validData)).rejects.toThrow(AppError)
      expect(updateUserPassword).not.toHaveBeenCalled()
    })
  })

  describe("deleteAccountService", () => {
    const validData = { password: "Test1234!" }

    it("should delete account if password is valid", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(mockUserPassword)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      // Act
      await deleteAccountService("user-123", validData)

      // Assert
      expect(deleteAllRefreshTokensByUserId).toHaveBeenCalledWith("user-123")
      expect(deleteUserById).toHaveBeenCalledWith("user-123")
    })

    it("should throw AppError if user not found", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(null)

      // Act & Assert
      await expect(deleteAccountService("user-123", validData)).rejects.toThrow(AppError)
      expect(deleteUserById).not.toHaveBeenCalled()
    })

    it("should throw AppError if password is incorrect", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(mockUserPassword)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      // Act & Assert
      await expect(deleteAccountService("user-123", validData)).rejects.toThrow(AppError)
      expect(deleteUserById).not.toHaveBeenCalled()
    })

    it("should invalidate all sessions before deleting account", async () => {
      // Arrange
      vi.mocked(findUserPasswordById).mockResolvedValue(mockUserPassword)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      // Act
      await deleteAccountService("user-123", validData)

      // Assert — tokens must be deleted BEFORE account deletion
      const deleteTokensOrder = vi.mocked(deleteAllRefreshTokensByUserId).mock.invocationCallOrder[0]
      const deleteUserOrder = vi.mocked(deleteUserById).mock.invocationCallOrder[0]
      expect(deleteTokensOrder).toBeLessThan(deleteUserOrder)
    })
  })
})