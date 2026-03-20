/**
 * Auth Routes Integration Tests
 * 
 * Tests the complete HTTP request/response cycle for auth endpoints.
 * Uses a real test database — reset before each test suite run.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import request from "supertest"
import app, { server } from "../../index.js"
import { prisma } from "../../lib/prisma.js"

describe("Auth Routes", () => {
  const validUser = {
    name: "Williams",
    email: "williams@test.com",
    password: "Test1234!"
  }

  describe("POST /api/auth/register", () => {
    it("should register a new user and return JWT token", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("token")
      expect(typeof response.body.token).toBe("string")
    })

    it("should return 400 if email is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "not-an-email" })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 400 if password is too weak", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "other@test.com", password: "weak" })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.code).toBe("VALIDATION_ERROR")
    })

    it("should return 409 if email already exists", async () => {
      // Arrange — register user first
      await request(app).post("/api/auth/register").send(validUser)

      // Act — try to register same email again
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser)

      // Assert
      expect(response.status).toBe(409)
      expect(response.body.code).toBe("EMAIL_ALREADY_EXISTS")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Arrange — ensure user exists before login tests
      await request(app).post("/api/auth/register").send(validUser)
    })

    it("should login and return JWT token", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")
    })

    it("should return 401 if password is incorrect", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "WrongPassword1!" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_CREDENTIALS")
    })

    it("should return 401 if email does not exist", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "notfound@test.com", password: "Test1234!" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_CREDENTIALS")
    })

    afterAll(async () => {
      await prisma.$disconnect()
      await new Promise<void>(resolve => server.close(() => resolve()))
    })
  })
})