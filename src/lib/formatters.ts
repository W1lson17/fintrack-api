import { Decimal } from "../generated/prisma/internal/prismaNamespace.js"

/**
 * Data Formatters
 * 
 * Helper functions to format data returned from the database.
 * Prisma returns Decimal fields as Decimal type — these formatters convert them to numbers.
 */

/**
 * Converts a Prisma Decimal value or number to a JavaScript number
 * Accepts number as fallback for cases where Prisma returns null (e.g. aggregate with no results)
 */
export const formatDecimal = (value: Decimal | number): number => Number(value)