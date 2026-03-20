/**
 * Report Routes Integration Tests
 * 
 * Tests the complete HTTP request/response cycle for report endpoints.
 * Uses a real test database — reset before each test suite run.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"

describe("Report Routes", () => {
  let token: string

  const testUser = {
    name: "Report Test User",
    email: "report-test@test.com",
    password: "Test1234!"
  }

  beforeAll(async () => {
    // Register user and create some transactions for reports
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(testUser)
    token = registerResponse.body.token

    // Create a category
    const categoryResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Comida", type: "EXPENSE" })
    const categoryId = categoryResponse.body.id

    // Create transactions for the current month
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 1500, type: "EXPENSE", categoryId })

    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 5000, type: "INCOME", categoryId })
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("GET /api/reports/summary", () => {
    it("should return monthly summary with correct totals", async () => {
      // Act
      const now = new Date()
      const response = await request(app)
        .get(`/api/reports/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("totalIncome")
      expect(response.body).toHaveProperty("totalExpenses")
      expect(response.body).toHaveProperty("balance")
      expect(response.body.totalExpenses).toBe(1500)
      expect(response.body.totalIncome).toBe(5000)
      expect(response.body.balance).toBe(3500)
    })

    it("should return 400 if month is invalid", async () => {
      // Act
      const response = await request(app)
        .get("/api/reports/summary?month=13&year=2026")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .get("/api/reports/summary?month=3&year=2026")

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("GET /api/reports/categories", () => {
    it("should return spending by category", async () => {
      // Act
      const now = new Date()
      const response = await request(app)
        .get(`/api/reports/categories?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty("categoryName")
      expect(response.body[0]).toHaveProperty("total")
    })

    it("should return 400 if year is invalid", async () => {
      // Act
      const response = await request(app)
        .get("/api/reports/categories?month=3&year=1999")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })
  })
})