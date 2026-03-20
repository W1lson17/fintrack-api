/**
 * Saving Goal Routes Integration Tests
 * 
 * Tests the complete HTTP request/response cycle for saving goal endpoints.
 * Uses a real test database — reset before each test suite run.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"
import { createTestUser } from "../utils/auth.js"

describe("Saving Goal Routes", () => {
  let token: string

  beforeAll(async () => {
    // Register user and get token
    const user = await createTestUser({ email: `saving-goal-${Date.now()}@test.com` })
    token = user.token
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("POST /api/saving-goals", () => {
    it("should create a saving goal and return it", async () => {
      // Act
      const response = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Vacaciones", targetAmount: 10000, deadline: "2027-12-31" })

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.name).toBe("Vacaciones")
      expect(response.body.targetAmount).toBe(10000)
    })

    it("should return 400 if targetAmount is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Vacaciones", targetAmount: -100 })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 401 if no token provided", async () => {
      // Act
      const response = await request(app)
        .post("/api/saving-goals")
        .send({ name: "Vacaciones", targetAmount: 10000 })

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe("GET /api/saving-goals", () => {
    it("should return all saving goals for the user", async () => {
      // Act
      const response = await request(app)
        .get("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe("GET /api/saving-goals/:id", () => {
    it("should return a saving goal by id", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Auto", targetAmount: 50000 })

      // Act
      const response = await request(app)
        .get(`/api/saving-goals/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(created.body.id)
    })

    it("should return 404 if saving goal not found", async () => {
      // Act
      const response = await request(app)
        .get("/api/saving-goals/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.code).toBe("SAVING_GOAL_NOT_FOUND")
    })
  })

  describe("PATCH /api/saving-goals/:id", () => {
    it("should update saving goal progress", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Casa", targetAmount: 100000 })

      // Act
      const response = await request(app)
        .patch(`/api/saving-goals/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 5000 })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.currentAmount).toBe(5000)
    })

    it("should return 400 if amount exceeds target", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Laptop", targetAmount: 1000 })

      // Act
      const response = await request(app)
        .patch(`/api/saving-goals/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 5000 })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("AMOUNT_EXCEEDS_TARGET")
    })
  })

  describe("DELETE /api/saving-goals/:id", () => {
    it("should delete a saving goal and return 204", async () => {
      // Arrange
      const created = await request(app)
        .post("/api/saving-goals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Fondo emergencia", targetAmount: 20000 })

      // Act
      const response = await request(app)
        .delete(`/api/saving-goals/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(204)
    })

    it("should return 404 if saving goal not found", async () => {
      // Act
      const response = await request(app)
        .delete("/api/saving-goals/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
    })
  })
})