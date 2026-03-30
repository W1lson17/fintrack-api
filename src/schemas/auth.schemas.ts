import z from "zod"

/**
 * Auth Schemas
 *
 * Zod schemas for validating authentication-related requests.
 * Covers registration, login, token refresh, logout and password reset.
 */

/**
 * Schema for user registration
 *
 * - name:     required, non-empty string
 * - email:    valid email format
 * - password: min 8, max 32 characters
 *             must contain lowercase, uppercase, number and special character
 */
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
})

/**
 * Schema for user login
 *
 * - email:    valid email format
 * - password: non-empty string — strength validation happens at registration
 */
export const loginSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required")
})

/**
 * Schema for refreshing an access token
 *
 * - refreshToken: required non-empty string
 *                 validated against DB in service — not a JWT, just a UUID stored token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
})

/**
 * Schema for logout
 *
 * - refreshToken: required — used to identify and invalidate the current session
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
})

/**
 * Schema for requesting a password reset
 *
 * - email: valid email format — used to find the account
 */
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required")
})

/**
 * Schema for resetting the password with a token
 *
 * - token:       the UUID token received via email
 * - newPassword: min 8, max 32 characters, same strength rules as registration
 * Note: confirmPassword is validated client-side only — not sent to the API
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
})

/**
 * Inferred TypeScript types from the schemas above.
 */
export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>
export type LogoutDto = z.infer<typeof logoutSchema>
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>