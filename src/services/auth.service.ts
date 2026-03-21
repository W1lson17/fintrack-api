import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {
  createUser,
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} from "../repositories/auth.repository.js"
import type { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from "../schemas/auth.schemas.js"
import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"

/**
 * Auth Service
 *
 * Business logic for authentication.
 * Implements access token + refresh token pattern:
 * - accessToken:  short-lived JWT (15 minutes), used on every request
 * - refreshToken: long-lived UUID (7 days), stored in DB, used only to rotate tokens
 */

const SALT_ROUNDS = 10
const ACCESS_TOKEN_EXPIRES_IN = "15m"
const REFRESH_TOKEN_EXPIRES_DAYS = 7

/**
 * Generates a short-lived JWT access token.
 * Throws if JWT_SECRET is not defined in environment.
 */
const generateAccessToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new AppError("JWT_SECRET is not defined", 500, ERROR_CODES.CONFIGURATION_ERROR)
  return jwt.sign({ id: userId, email }, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
}

/**
 * Generates a refresh token expiration date.
 * Returns a Date object set to REFRESH_TOKEN_EXPIRES_DAYS days from now.
 */
const generateRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS)
  return expiresAt
}

/**
 * Registers a new user and returns access + refresh tokens.
 * Throws 409 if email is already in use.
 */
export const register = async (data: RegisterDto) => {
  const existingUser = await findUserByEmail(data.email)
  if (existingUser) throw new AppError("Email is already in use", 409, ERROR_CODES.EMAIL_ALREADY_EXISTS)

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
  const user = await createUser({ ...data, password: hashedPassword })

  const accessToken = generateAccessToken(user.id, user.email)
  // crypto.randomUUID() is native in Node.js 18+ — no external dependency needed
  const refreshToken = crypto.randomUUID()
  await createRefreshToken(refreshToken, user.id, generateRefreshTokenExpiry())

  return { accessToken, refreshToken }
}

/**
 * Authenticates a user and returns access + refresh tokens.
 * Throws 401 if email or password is invalid — same message to prevent user enumeration.
 */
export const login = async (data: LoginDto) => {
  const user = await findUserByEmail(data.email)
  if (!user) throw new AppError("Invalid email or password", 401, ERROR_CODES.INVALID_CREDENTIALS)

  const isPasswordValid = await bcrypt.compare(data.password, user.password)
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401, ERROR_CODES.INVALID_CREDENTIALS)

  const accessToken = generateAccessToken(user.id, user.email)
  const refreshToken = crypto.randomUUID()
  await createRefreshToken(refreshToken, user.id, generateRefreshTokenExpiry())

  return { accessToken, refreshToken }
}

/**
 * Rotates a refresh token — invalidates the old one and issues a new pair.
 *
 * Validates:
 * - Token exists in DB
 * - Token has not expired
 *
 * On success: deletes old token, creates new refresh token, returns new access + refresh tokens.
 * This is called "refresh token rotation" — each refresh token can only be used once.
 */
export const refresh = async (data: RefreshTokenDto) => {
  const existing = await findRefreshToken(data.refreshToken)
  if (!existing) throw new AppError("Invalid refresh token", 401, ERROR_CODES.INVALID_REFRESH_TOKEN)

  // Check if token has expired
  if (existing.expiresAt < new Date()) {
    // Clean up expired token before throwing
    await deleteRefreshToken(data.refreshToken)
    throw new AppError("Refresh token has expired", 401, ERROR_CODES.REFRESH_TOKEN_EXPIRED)
  }

  // Rotate — delete old token and issue new pair
  await deleteRefreshToken(data.refreshToken)

  const accessToken = generateAccessToken(existing.user.id, existing.user.email)
  const refreshToken = crypto.randomUUID()
  await createRefreshToken(refreshToken, existing.user.id, generateRefreshTokenExpiry())

  return { accessToken, refreshToken }
}

/**
 * Invalidates a refresh token — ends the current session.
 * Throws 401 if token does not exist in DB.
 */
export const logout = async (data: LogoutDto) => {
  const existing = await findRefreshToken(data.refreshToken)
  if (!existing) throw new AppError("Invalid refresh token", 401, ERROR_CODES.INVALID_REFRESH_TOKEN)

  await deleteRefreshToken(data.refreshToken)
}