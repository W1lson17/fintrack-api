import { prisma } from "../lib/prisma.js"
import type { RegisterDto } from "../schemas/auth.schemas.js"

/**
 * Auth Repository
 *
 * Handles all database operations for authentication.
 * Includes user lookup/creation and refresh token lifecycle management.
 */

/**
 * Finds a user by their email address.
 * Used during login and registration to check for existing accounts.
 */
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  })
}

/**
 * Creates a new user record in the database.
 * Password must be hashed before calling this function.
 */
export const createUser = async (data: RegisterDto) => {
  return prisma.user.create({
    data
  })
}

/**
 * Persists a new refresh token for a user.
 *
 * - token:     the raw token string (UUID v4)
 * - userId:    owner of the token
 * - expiresAt: expiration date — validated in service before storing
 */
export const createRefreshToken = async (token: string, userId: string, expiresAt: Date) => {
  return prisma.refreshToken.create({
    data: { token, userId, expiresAt }
  })
}

/**
 * Finds a refresh token by its raw value.
 * Used during token refresh to validate the incoming token.
 * Includes user data to avoid a second query in the service.
 */
export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  })
}

/**
 * Deletes a single refresh token by its raw value.
 * Called during logout to invalidate the current session.
 */
export const deleteRefreshToken = async (token: string) => {
  return prisma.refreshToken.delete({
    where: { token }
  })
}

/**
 * Deletes all refresh tokens belonging to a user.
 * Useful for "logout from all devices" or security revocation scenarios.
 */
export const deleteAllRefreshTokensByUserId = async (userId: string) => {
  return prisma.refreshToken.deleteMany({
    where: { userId }
  })
}