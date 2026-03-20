/**
 * Transaction Routes Integration Tests
 * 
 * Tests the complete HTTP request/response cycle for transaction endpoints.
 * Uses a real test database — reset before each test suite run.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"
import { createTestUser } from "../utils/auth.js"

describe("Transaction Routes", () => {
  let token: string
  let categoryId: string

  beforeAll(async () => {
    // Register user and get token
    const user = await createTestUser({ email: `transaction-${Date.now()}@test.com` })
    token = user.token

    // Create a category to use in transactions
    const categoryResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Comida", type: "EXPENSE" })
    categoryId = categoryResponse.body.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("POST /api/transactions", () => {
    it("should create a transaction and return it", async () => {
      // Act
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 500, type: "EXPENSE", categoryId, description: "Supermercado" })

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.amount).toBe(500)
      expect(response.body.type).toBe("EXPENSE")
    })

    it("should return 400 if amount is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: -100, type: "EXPENSE", categoryId })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .post("/api/transactions")
        .send({ amount: 500, type: "EXPENSE", categoryId })

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("GET /api/transactions", () => {
    it("should return all transactions for the user", async () => {
      // Act
      const response = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it("should filter transactions by type", async () => {
      // Act
      const response = await request(app)
        .get("/api/transactions?type=EXPENSE")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe("GET /api/transactions/:id", () => {
    it("should return a transaction by id", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 200, type: "EXPENSE", categoryId })

      // Act
      const response = await request(app)
        .get(`/api/transactions/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(created.body.id)
    })

    it("should return 404 if transaction not found", async () => {
      // Act
      const response = await request(app)
        .get("/api/transactions/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.code).toBe("TRANSACTION_NOT_FOUND")
    })
  })

  describe("DELETE /api/transactions/:id", () => {
    it("should delete a transaction and return 204", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 300, type: "EXPENSE", categoryId })

      // Act
      const response = await request(app)
        .delete(`/api/transactions/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(204)
    })

    it("should return 404 if transaction not found", async () => {
      // Act
      const response = await request(app)
        .delete("/api/transactions/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
    })
  })
})