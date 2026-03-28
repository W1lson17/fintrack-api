/**
 * User Routes Integration Tests
 *
 * Tests the complete HTTP request/response cycle for user profile endpoints.
 * Uses a real test database — reset before each test suite run.
 *
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"
import { createTestUser } from "../utils/auth.js"

describe("User Routes", () => {
  let token: string

  // Register once before all tests — reuse token across all tests
  beforeAll(async () => {
    const user = await createTestUser({ email: `user-${Date.now()}@test.com` })
    token = user.token
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("GET /api/users/me", () => {
    it("should return the authenticated user's profile", async () => {
      // Act
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty("id")
      expect(response.body.data).toHaveProperty("email")
      expect(response.body.data).toHaveProperty("name")
      // Password must never be exposed
      expect(response.body.data).not.toHaveProperty("password")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app).get("/api/users/me")

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("PATCH /api/users/me/name", () => {
    it("should update the user's name and return updated profile", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/name")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("Updated Name")
    })

    it("should return 400 if name is empty", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/name")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/name")
        .send({ name: "Updated Name" })

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("PATCH /api/users/me/password", () => {
    it("should change password and return 204", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "Test1234!", newPassword: "NewPass1!" })

      // Assert
      expect(response.status).toBe(204)
    })

    it("should return 401 if current password is incorrect", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "WrongPass1!", newPassword: "NewPass1!" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_CREDENTIALS")
    })

    it("should return 400 if new password does not meet requirements", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "NewPass1!", newPassword: "weak" })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .patch("/api/users/me/password")
        .send({ currentPassword: "Test1234!", newPassword: "NewPass1!" })

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("DELETE /api/users/me", () => {
    it("should return 401 if password is incorrect", async () => {
      // Act
      const response = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ password: "WrongPass1!" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_CREDENTIALS")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .delete("/api/users/me")
        .send({ password: "NewPass1!" })

      // Assert
      expect(response.status).toBe(401)
    })

    it("should delete account and return 204", async () => {
      // Arrange — create a separate user to avoid breaking other tests
      const userToDelete = await createTestUser({ email: `delete-${Date.now()}@test.com` })

      // Act
      const response = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${userToDelete.token}`)
        .send({ password: "Test1234!" })

      // Assert
      expect(response.status).toBe(204)
    })
  })
})