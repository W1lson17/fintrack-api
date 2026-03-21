/**
 * JWT Authentication Middleware
 *
 * Validates JWT tokens on incoming requests.
 * Extracts the token from the Authorization header and verifies it.
 *
 * Expected Authorization header format: "Bearer <token>"
 *
 * On success: Attaches decoded user info to req.user and calls next()
 * On failure: Throws AppError with 401 status
 */

import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Extract token from "Bearer <token>" header
  const authHeader = req.headers["authorization"]
  const token = authHeader?.split(" ")[1]

  // Return 401 if no token provided
  if (!token) {
    throw new AppError("Authentication token required", 401, ERROR_CODES.UNAUTHORIZED)
  }

  // Ensure JWT_SECRET is configured
  const secret = process.env.JWT_SECRET
  if (!secret) throw new AppError("JWT_SECRET is not defined", 500, ERROR_CODES.CONFIGURATION_ERROR)

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, secret) as { id: string; email: string }

    // Attach decoded user to request for use in controllers
    req.user = decoded
    next()
  } catch {
    // Token is invalid or expired
    throw new AppError("Invalid or expired token", 401, ERROR_CODES.UNAUTHORIZED)
  }
}