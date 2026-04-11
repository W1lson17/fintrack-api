import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {
  createUser,
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} from "../repositories/auth.repository.js"
import {
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenAsUsed,
  deleteAllPasswordResetTokensByUserId
} from "../repositories/password-reset.repository.js"
import { updateUserPassword } from "../repositories/user.repository.js"
import { sendPasswordResetEmail } from "../lib/email.service.js"
import type { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto, ForgotPasswordDto, ResetPasswordDto } from "../schemas/auth.schemas.js"
import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import { SALT_ROUNDS, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS, PASSWORD_RESET_EXPIRES_HOURS } from "../lib/constants.js"

/**
 * Auth Service
 *
 * Business logic for authentication.
 * Implements access token + refresh token pattern:
 * - accessToken:  short-lived JWT (15 minutes), used on every request
 * - refreshToken: long-lived UUID (7d), stored in DB, used only to rotate tokens
 */

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
 * Generates a password reset token expiration date.
 * Returns a Date object set to PASSWORD_RESET_EXPIRES_HOURS from now.
 */
const generatePasswordResetTokenExpiry = (): Date => {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRES_HOURS)
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

  if (existing.expiresAt < new Date()) {
    await deleteRefreshToken(data.refreshToken)
    throw new AppError("Refresh token has expired", 401, ERROR_CODES.REFRESH_TOKEN_EXPIRED)
  }

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

/**
 * Sends a password reset email to the user.
 * Deletes any existing reset tokens before creating a new one — prevents multiple active tokens.
 * Always returns silently if user not found — prevents user enumeration attacks.
 */
export const forgotPassword = async (data: ForgotPasswordDto) => {
  const user = await findUserByEmail(data.email)

  // Return silently if user not found — prevents user enumeration
  if (!user) return

  await deleteAllPasswordResetTokensByUserId(user.id)

  const token = crypto.randomUUID()
  await createPasswordResetToken(token, user.id, generatePasswordResetTokenExpiry())

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`
  await sendPasswordResetEmail(user.email, resetUrl)
}

/**
 * Resets the user's password using a valid reset token.
 * Validates token existence, expiry and used status before updating.
 * Marks token as used after successful reset — single-use enforcement.
 */
export const resetPassword = async (data: ResetPasswordDto) => {
  const existing = await findPasswordResetToken(data.token)
  if (!existing) throw new AppError("Invalid or expired reset token", 400, ERROR_CODES.INVALID_RESET_TOKEN)

  if (existing.used) throw new AppError("Reset token has already been used", 400, ERROR_CODES.INVALID_RESET_TOKEN)

  if (existing.expiresAt < new Date()) throw new AppError("Reset token has expired", 400, ERROR_CODES.INVALID_RESET_TOKEN)

  const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS)
  await updateUserPassword(existing.userId, hashedPassword)
  await markPasswordResetTokenAsUsed(data.token)
}