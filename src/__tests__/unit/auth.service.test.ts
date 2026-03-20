/**
 * Auth Service Unit Tests
 * 
 * Tests business logic of auth service in isolation.
 * Repositories are mocked — no real database calls are made.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

// Mock repositories BEFORE imports — vi.mock is hoisted to top of file
// This prevents Prisma client from loading during tests
vi.mock("../../repositories/auth.repository.js", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn()
}))

import { register, login } from "../../services/auth.service.js"
import { findUserByEmail, createUser } from "../../repositories/auth.repository.js"
import { AppError } from "../../lib/AppError.js"

describe("AuthService", () => {
  // Clear all mocks before each test to avoid state contamination
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("register", () => {
    const validData = {
      name: "Williams",
      email: "williams@test.com",
      password: "Test1234!"
    }

    it("should throw AppError if email already exists", async () => {
      // Arrange — simulate existing user in DB
      vi.mocked(findUserByEmail).mockResolvedValue({
        id: "123",
        email: validData.email,
        name: validData.name,
        password: "hashedpassword",
        createdAt: new Date()
      })

      // Act & Assert
      await expect(register(validData)).rejects.toThrow(AppError)
    })

    it("should return JWT token on successful registration", async () => {
      // Arrange — simulate no existing user
      vi.mocked(findUserByEmail).mockResolvedValue(null)
      vi.mocked(createUser).mockResolvedValue({
        id: "123",
        email: validData.email,
        name: validData.name,
        password: "hashedpassword",
        createdAt: new Date()
      })

      // Act
      const result = await register(validData)

      // Assert
      expect(result).toHaveProperty("token")
      expect(typeof result.token).toBe("string")
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
      vi.mocked(findUserByEmail).mockResolvedValue({
        id: "123",
        email: "williams@test.com",
        name: "Williams",
        password: "$2b$10$invalidhashedpassword",
        createdAt: new Date()
      })

      // Act & Assert
      await expect(login({ email: "williams@test.com", password: "WrongPassword1!" }))
        .rejects.toThrow(AppError)
    })

    it("should return JWT token on successful login", async () => {
      // Arrange — bcrypt hash of "Test1234!"
      vi.mocked(findUserByEmail).mockResolvedValue({
        id: "123",
        email: "williams@test.com",
        name: "Williams",
        password: "$2b$10$Km14MUAghGvsmRnh0M.HIuzrPOmC1jaCre9TipBs.VDjNvsVccIsa",
        createdAt: new Date()
      })

      // Act
      const result = await login({ email: "williams@test.com", password: "Test1234!" })

      // Assert
      expect(result).toHaveProperty("token")
      expect(typeof result.token).toBe("string")
    })
  })
})