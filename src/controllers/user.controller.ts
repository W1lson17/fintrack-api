import type { Request, Response } from "express"
import * as userService from "../services/user.service.js"
import type { UpdateNameDto, ChangePasswordDto, DeleteAccountDto } from "../schemas/user.schemas.js"

/**
 * User Controllers
 *
 * Handles HTTP requests for user profile management.
 * Delegates all business logic to userService.
 */

/**
 * GET /api/users/me
 * Returns the authenticated user's profile data.
 */
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const user = await userService.getProfileService(userId)
  res.status(200).json({ data: user })
}

/**
 * PATCH /api/users/me/name
 * Updates the authenticated user's name.
 * Request body is validated and injected by validateRequest middleware via req.validated.
 */
export const updateName = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const body = req.validated?.body as UpdateNameDto
  const user = await userService.updateNameService(userId, body)
  res.status(200).json({ data: user })
}

/**
 * PATCH /api/users/me/password
 * Changes the authenticated user's password.
 * Verifies current password before updating.
 * Returns 204 No Content on success.
 */
export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const body = req.validated?.body as ChangePasswordDto
  await userService.changePasswordService(userId, body)
  res.status(204).send()
}

/**
 * DELETE /api/users/me
 * Deletes the authenticated user's account.
 * Requires password confirmation before deletion.
 * Invalidates all sessions before removing the account.
 * Returns 204 No Content on success.
 */
export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const body = req.validated?.body as DeleteAccountDto
  await userService.deleteAccountService(userId, body)
  res.status(204).send()
}