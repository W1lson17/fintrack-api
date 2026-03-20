/**
 * Category Routes Integration Tests
 * 
 * Tests the complete HTTP request/response cycle for category endpoints.
 * Uses a real test database — reset before each test suite run.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"

describe("Category Routes", () => {
  let token: string

  // Use unique email to avoid conflicts with other test suites
  const testUser = {
    name: "Category Test User",
    email: "category-test@test.com",
    password: "Test1234!"
  }

  // Register once before all tests — reuse token across all tests
  beforeAll(async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser)
    token = response.body.token
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("POST /api/categories", () => {
    it("should create a category and return it", async () => {
      // Act
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Comida", type: "EXPENSE" })

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.name).toBe("Comida")
      expect(response.body.type).toBe("EXPENSE")
    })

    it("should return 400 if type is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Comida", type: "INVALID" })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 409 if category already exists", async () => {
      // Arrange — create category first
      await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Renta", type: "EXPENSE" })

      // Act — try to create same category again
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Renta", type: "EXPENSE" })

      // Assert
      expect(response.status).toBe(409)
      expect(response.body.code).toBe("CATEGORY_ALREADY_EXISTS")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .post("/api/categories")
        .send({ name: "Comida", type: "EXPENSE" })

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("GET /api/categories", () => {
    it("should return all categories for the user", async () => {
      // Act
      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe("GET /api/categories/:id", () => {
    it("should return a category by id", async () => {
      // Arrange — create category first
      const created = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Transporte", type: "EXPENSE" })

      // Act
      const response = await request(app)
        .get(`/api/categories/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(created.body.id)
    })

    it("should return 404 if category not found", async () => {
      // Act
      const response = await request(app)
        .get("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.code).toBe("CATEGORY_NOT_FOUND")
    })
  })

  describe("DELETE /api/categories/:id", () => {
    it("should delete a category and return 204", async () => {
      // Arrange — create category first
      const created = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Entretenimiento", type: "EXPENSE" })

      // Act
      const response = await request(app)
        .delete(`/api/categories/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(204)
    })

    it("should return 404 if category not found", async () => {
      // Act
      const response = await request(app)
        .delete("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
    })
  })
})