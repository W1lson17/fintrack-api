import z from "zod"

/**
 * User Schemas
 *
 * Zod schemas for validating user profile-related requests.
 * Covers profile update, password change and account deletion.
 */

/**
 * Schema for updating user name
 *
 * - name: required, min 1, max 255 characters
 */
export const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters")
})

/**
 * Schema for changing user password
 *
 * - currentPassword: required — verified against stored hash before updating
 * - newPassword:     min 8, max 32 characters, same strength rules as registration
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
})

/**
 * Schema for deleting user account
 *
 * - password: required — user must confirm their password before deletion
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account")
})

export type UpdateNameDto = z.infer<typeof updateNameSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>