/**
 * Auth Service Unit Tests
 *
 * Tests business logic of auth service in isolation.
 * Repositories are mocked — no real database calls are made.
 *
 * Pattern: AAA (Arrange, Act, Assert)
 */

// Mock repositories BEFORE imports — vi.mock is hoisted to top of file
vi.mock("../../repositories/auth.repository.js", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  createRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  deleteAllRefreshTokensByUserId: vi.fn()
}))

import { register, login, refresh, logout } from "../../services/auth.service.js"
import {
  findUserByEmail,
  createUser,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} from "../../repositories/auth.repository.js"
import { AppError } from "../../lib/AppError.js"

const mockUser = {
  id: "user-123",
  email: "williams@test.com",
  name: "Williams",
  password: "$2b$10$Km14MUAghGvsmRnh0M.HIuzrPOmC1jaCre9TipBs.VDjNvsVccIsa", // bcrypt hash of "Test1234!"
  createdAt: new Date()
}

const mockRefreshToken = {
  id: "token-123",
  token: "mock-refresh-token",
  userId: "user-123",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date(),
  user: mockUser
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock — createRefreshToken always succeeds
    vi.mocked(createRefreshToken).mockResolvedValue(mockRefreshToken)
  })

  describe("register", () => {
    const validData = {
      name: "Williams",
      email: "williams@test.com",
      password: "Test1234!"
    }

    it("should throw AppError if email already exists", async () => {
      // Arrange
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser)

      // Act & Assert
      await expect(register(validData)).rejects.toThrow(AppError)
      expect(createUser).not.toHaveBeenCalled()
    })

    it("should return accessToken and refreshToken on successful registration", async () => {
      // Arrange
      vi.mocked(findUserByEmail).mockResolvedValue(null)
      vi.mocked(createUser).mockResolvedValue(mockUser)

      // Act
      const result = await register(validData)

      // Assert
      expect(result).toHaveProperty("accessToken")
      expect(result).toHaveProperty("refreshToken")
      expect(typeof result.accessToken).toBe("string")
      expect(typeof result.refreshToken).toBe("string")
      expect(createRefreshToken).toHaveBeenCalledOnce()
    })
  })

  describe("login", () => {
    it("should throw AppError if user does not exist", async () => {
      // Arrange
      vi.mocked(findUserByEmail).mockResolvedValue(null)

      // Act & Assert
      await expect(login({ email: "notfound@test.com", password: "Test1234!" }))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if password is incorrect", async () => {
      // Arrange
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser)

      // Act & Assert
      await expect(login({ email: "williams@test.com", password: "WrongPassword1!" }))
        .rejects.toThrow(AppError)
    })

    it("should return accessToken and refreshToken on successful login", async () => {
      // Arrange
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser)

      // Act
      const result = await login({ email: "williams@test.com", password: "Test1234!" })

      // Assert
      expect(result).toHaveProperty("accessToken")
      expect(result).toHaveProperty("refreshToken")
      expect(typeof result.accessToken).toBe("string")
      expect(typeof result.refreshToken).toBe("string")
      expect(createRefreshToken).toHaveBeenCalledOnce()
    })
  })

  describe("refresh", () => {
    it("should throw AppError if refresh token does not exist", async () => {
      // Arrange
      vi.mocked(findRefreshToken).mockResolvedValue(null)

      // Act & Assert
      await expect(refresh({ refreshToken: "invalid-token" }))
        .rejects.toThrow(AppError)
    })

    it("should throw AppError if refresh token has expired", async () => {
      // Arrange — token expired in the past
      vi.mocked(findRefreshToken).mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000)
      })

      // Act & Assert
      await expect(refresh({ refreshToken: "expired-token" }))
        .rejects.toThrow(AppError)
      expect(deleteRefreshToken).toHaveBeenCalledOnce()
    })

    it("should rotate tokens and return new accessToken and refreshToken", async () => {
      // Arrange
      vi.mocked(findRefreshToken).mockResolvedValue(mockRefreshToken)

      // Act
      const result = await refresh({ refreshToken: "mock-refresh-token" })

      // Assert
      expect(result).toHaveProperty("accessToken")
      expect(result).toHaveProperty("refreshToken")
      expect(typeof result.accessToken).toBe("string")
      expect(typeof result.refreshToken).toBe("string")
      // Old token deleted, new token created
      expect(deleteRefreshToken).toHaveBeenCalledWith("mock-refresh-token")
      expect(createRefreshToken).toHaveBeenCalledOnce()
    })
  })

  describe("logout", () => {
    it("should throw AppError if refresh token does not exist", async () => {
      // Arrange
      vi.mocked(findRefreshToken).mockResolvedValue(null)

      // Act & Assert
      await expect(logout({ refreshToken: "invalid-token" }))
        .rejects.toThrow(AppError)
    })

    it("should delete refresh token on successful logout", async () => {
      // Arrange
      vi.mocked(findRefreshToken).mockResolvedValue(mockRefreshToken)

      // Act
      await logout({ refreshToken: "mock-refresh-token" })

      // Assert
      expect(deleteRefreshToken).toHaveBeenCalledWith("mock-refresh-token")
    })
  })
})