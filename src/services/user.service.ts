import bcrypt from "bcryptjs"
import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import { SALT_ROUNDS } from "../lib/constants.js"
import {
  findUserById,
  updateUserName,
  updateUserPassword,
  findUserPasswordById,
  deleteUserById
} from "../repositories/user.repository.js"
import { deleteAllRefreshTokensByUserId } from "../repositories/auth.repository.js"
import type { UpdateNameDto, ChangePasswordDto, DeleteAccountDto } from "../schemas/user.schemas.js"

/**
 * User Service
 *
 * Business logic for user profile management.
 * Handles password verification before sensitive operations.
 */

/**
 * Retrieves the authenticated user's profile.
 * Throws 404 if user not found — should not happen in practice since
 * the user is authenticated, but guards against edge cases.
 */
export const getProfileService = async (userId: string) => {
  const user = await findUserById(userId)
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND)
  return user
}

/**
 * Updates the authenticated user's name.
 */
export const updateNameService = async (userId: string, data: UpdateNameDto) => {
  const user = await findUserById(userId)
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND)
  return updateUserName(userId, data.name)
}

/**
 * Changes the authenticated user's password.
 * Verifies current password before updating.
 * Throws 401 if current password is incorrect.
 */
export const changePasswordService = async (userId: string, data: ChangePasswordDto) => {
  const userPassword = await findUserPasswordById(userId)
  if (!userPassword) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND)

  const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, userPassword.password)
  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 401, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS)
  await updateUserPassword(userId, hashedPassword)
}

/**
 * Deletes the authenticated user's account.
 * Verifies password before deletion.
 * Invalidates all refresh tokens before deleting the account.
 */
export const deleteAccountService = async (userId: string, data: DeleteAccountDto) => {
  const userPassword = await findUserPasswordById(userId)
  if (!userPassword) throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND)

  const isPasswordValid = await bcrypt.compare(data.password, userPassword.password)
  if (!isPasswordValid) {
    throw new AppError("Password is incorrect", 401, ERROR_CODES.INVALID_CREDENTIALS)
  }

  await deleteAllRefreshTokensByUserId(userId)
  await deleteUserById(userId)
}