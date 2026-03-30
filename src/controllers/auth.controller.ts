import type { Request, Response } from "express"
import * as authService from "../services/auth.service.js"
import type { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto, ForgotPasswordDto, ResetPasswordDto } from "../schemas/auth.schemas.js"

/**
 * Auth Controllers
 *
 * Handles HTTP requests for authentication.
 * Delegates all business logic to authService.
 */

/**
 * POST /api/auth/register
 * Creates a new user account and returns access + refresh tokens.
 */
export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response
) => {
  const result = await authService.register(req.body)
  res.status(201).json(result)
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns access + refresh tokens.
 */
export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response
) => {
  const result = await authService.login(req.body)
  res.status(200).json(result)
}

/**
 * POST /api/auth/refresh
 * Rotates a refresh token — returns new access + refresh tokens.
 * Old refresh token is invalidated immediately after use.
 */
export const refresh = async (
  req: Request<{}, {}, RefreshTokenDto>,
  res: Response
) => {
  const result = await authService.refresh(req.body)
  res.status(200).json(result)
}

/**
 * POST /api/auth/logout
 * Invalidates the provided refresh token — ends the current session.
 */
export const logout = async (
  req: Request<{}, {}, LogoutDto>,
  res: Response
) => {
  await authService.logout(req.body)
  // 204 No Content — successful logout returns no body
  res.status(204).send()
}

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email to the user.
 * Always returns 204 — prevents user enumeration attacks.
 */
export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordDto>,
  res: Response
) => {
  await authService.forgotPassword(req.body)
  // 204 No Content — always returns success to prevent user enumeration
  res.status(204).send()
}

/**
 * POST /api/auth/reset-password
 * Resets the user's password using a valid reset token.
 * Returns 204 No Content on success.
 */
export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordDto>,
  res: Response
) => {
  await authService.resetPassword(req.body)
  // 204 No Content — successful reset returns no body
  res.status(204).send()
}