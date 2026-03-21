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
    email: `auth-${Date.now()}@test.com`,
    password: "Test1234!"
  }

  afterAll(async () => {
    await prisma.$disconnect()
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user and return accessToken and refreshToken", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      expect(typeof response.body.accessToken).toBe("string")
      expect(typeof response.body.refreshToken).toBe("string")
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

    it("should login and return accessToken and refreshToken", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      expect(typeof response.body.accessToken).toBe("string")
      expect(typeof response.body.refreshToken).toBe("string")
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
  })

  describe("POST /api/auth/refresh", () => {
    let refreshToken: string

    beforeEach(async () => {
      // Arrange — register and capture refreshToken
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: `refresh-${Date.now()}@test.com` })
      refreshToken = response.body.refreshToken
    })

    it("should return new accessToken and refreshToken", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      expect(typeof response.body.accessToken).toBe("string")
      expect(typeof response.body.refreshToken).toBe("string")
      // New refresh token must differ from the old one — rotation confirmed
      expect(response.body.refreshToken).not.toBe(refreshToken)
    })

    it("should return 401 if refresh token is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_REFRESH_TOKEN")
    })

    it("should return 401 if refresh token is used twice — rotation enforced", async () => {
      // Arrange — use token once
      await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })

      // Act — try to use same token again
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_REFRESH_TOKEN")
    })
  })

  describe("POST /api/auth/logout", () => {
    let refreshToken: string

    beforeEach(async () => {
      // Arrange — register and capture refreshToken
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: `logout-${Date.now()}@test.com` })
      refreshToken = response.body.refreshToken
    })

    it("should logout and return 204", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken })

      // Assert
      expect(response.status).toBe(204)
    })

    it("should return 401 if refresh token is invalid", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "invalid-token" })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_REFRESH_TOKEN")
    })

    it("should invalidate token — cannot refresh after logout", async () => {
      // Arrange — logout first
      await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken })

      // Act — try to refresh with invalidated token
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.code).toBe("INVALID_REFRESH_TOKEN")
    })
  })
})