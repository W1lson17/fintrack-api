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