import { prisma } from "../lib/prisma.js"

/**
 * Password Reset Repository
 *
 * Handles all database operations for password reset token lifecycle.
 * Tokens are single-use — marked as used after a successful reset.
 */

/**
 * Persists a new password reset token for a user.
 *
 * - token:     the raw token string (UUID v4)
 * - userId:    owner of the token
 * - expiresAt: expiration date — validated in service before storing
 */
export const createPasswordResetToken = async (
  token: string,
  userId: string,
  expiresAt: Date
) => {
  return prisma.passwordResetToken.create({
    data: { token, userId, expiresAt }
  })
}

/**
 * Finds a password reset token by its raw value.
 * Used during reset to validate the incoming token.
 * Includes user data to avoid a second query in the service.
 */
export const findPasswordResetToken = async (token: string) => {
  return prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })
}

/**
 * Marks a password reset token as used.
 * Prevents token reuse after a successful password reset.
 */
export const markPasswordResetTokenAsUsed = async (token: string) => {
  return prisma.passwordResetToken.update({
    where: { token },
    data: { used: true }
  })
}

/**
 * Deletes all password reset tokens belonging to a user.
 * Called before creating a new token — prevents multiple active tokens per user.
 */
export const deleteAllPasswordResetTokensByUserId = async (userId: string) => {
  return prisma.passwordResetToken.deleteMany({
    where: { userId }
  })
}