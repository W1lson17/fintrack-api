/**
 * Middlewares Unit Tests
 * 
 * Tests validateRequest, errorHandler and authenticateToken middlewares.
 * Uses mock req/res/next objects to simulate Express behavior.
 * 
 * Pattern: AAA (Arrange, Act, Assert)
 */

import type { Request, Response, NextFunction } from "express"

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockRequest = (overrides = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides
})

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res) as any
  res.json = jest.fn().mockReturnValue(res) as any
  res.send = jest.fn().mockReturnValue(res) as any
  return res
}

const mockNext = (): NextFunction => jest.fn() as any

// ─── validateRequest ────────────────────────────────────────────────────────

import { validateRequest } from "../../middlewares/validateRequest.js"
import z from "zod"

describe("validateRequest", () => {
  it("should call next() if validation passes", () => {
    // Arrange
    const schema = z.object({ name: z.string() })
    const req = mockRequest({ body: { name: "Williams" } })
    const res = mockResponse()
    const next = mockNext()

    // Act
    validateRequest({ body: schema })(req as Request, res as Response, next)

    // Assert
    expect(next).toHaveBeenCalledWith()
  })

  it("should return 400 if body validation fails", () => {
    // Arrange
    const schema = z.object({ name: z.string().min(1) })
    const req = mockRequest({ body: { name: "" } })
    const res = mockResponse()
    const next = mockNext()

    // Act
    validateRequest({ body: schema })(req as Request, res as Response, next)

    // Assert
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).not.toHaveBeenCalled()
  })

  it("should return 400 if params validation fails", () => {
    // Arrange
    const schema = z.object({ id: z.uuid() })
    const req = mockRequest({ params: { id: "not-a-uuid" } })
    const res = mockResponse()
    const next = mockNext()

    // Act
    validateRequest({ params: schema })(req as Request, res as Response, next)

    // Assert
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

// ─── errorHandler ───────────────────────────────────────────────────────────

import { errorHandler } from "../../middlewares/errorHandler.js"
import { AppError } from "../../lib/AppError.js"

describe("errorHandler", () => {
  it("should return AppError statusCode and message for known errors", () => {
    // Arrange
    const error = new AppError("Not found", 404, "NOT_FOUND")
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    // Act
    errorHandler(error, req as Request, res as Response, next)

    // Assert
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "NOT_FOUND",
      message: "Not found"
    }))
  })

  it("should return 500 for unknown errors", () => {
    // Arrange
    const error = new Error("Unexpected error")
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    // Act
    errorHandler(error, req as Request, res as Response, next)

    // Assert
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "INTERNAL_SERVER_ERROR"
    }))
  })
})

// ─── authenticateToken ──────────────────────────────────────────────────────

import { authenticateToken } from "../../middlewares/auth.middleware.js"
import jwt from "jsonwebtoken"

describe("authenticateToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key"
  })

  it("should throw AppError if no token provided", () => {
    // Arrange
    const req = mockRequest({ headers: {} })
    const res = mockResponse()
    const next = mockNext()

    // Act & Assert
    expect(() => {
      authenticateToken(req as Request, res as Response, next)
    }).toThrow(AppError)
  })

  it("should throw AppError if token is invalid", () => {
    // Arrange
    const req = mockRequest({ headers: { authorization: "Bearer invalidtoken" } })
    const res = mockResponse()
    const next = mockNext()

    // Act & Assert
    expect(() => {
      authenticateToken(req as Request, res as Response, next)
    }).toThrow(AppError)
  })

  it("should call next() and set req.user if token is valid", () => {
    // Arrange
    const token = jwt.sign({ id: "user-123", email: "test@test.com" }, "test-secret-key")
    const req = mockRequest({ headers: { authorization: `Bearer ${token}` } }) as any
    const res = mockResponse()
    const next = mockNext()

    // Act
    authenticateToken(req as Request, res as Response, next)

    // Assert
    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(expect.objectContaining({ id: "user-123" }))
  })
})