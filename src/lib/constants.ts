/**
 * Shared Constants
 *
 * Centralized constants used across the application.
 * Defined as const arrays instead of TypeScript enums to avoid
 * generating extra JavaScript code and for better Zod compatibility
 */

/**
 * Transaction Types used in both categories and transactions
 *
 * Defined as const array instead of TypeScript enum to avoid
 * generating extra JavaScript code and for better Zod compatibility
 */
export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

/**
 * Auth constants
 *
 * Centralized to avoid duplication between auth.service.ts and user.service.ts
 */
export const SALT_ROUNDS = 10
export const ACCESS_TOKEN_EXPIRES_IN = "15m"
export const REFRESH_TOKEN_EXPIRES_DAYS = 7

/**
 * Password reset constants
 *
 * Token expires in 1 hour — short window to minimize security risk.
 */
export const PASSWORD_RESET_EXPIRES_HOURS = 1