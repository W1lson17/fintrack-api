import { Decimal } from "../generated/prisma/internal/prismaNamespace.js";


/**
 * Data Formatters
 * 
 * Helper functions to format data returned from the database.
 * Prisma returns Decimal fields as the Decimal type — these formatters convert them to numbers.
 */


/**
 * Converts a Prisma Decimal value to a JavaScript number
 * Use this for any Decimal field returned from the database
 */
export const formatDecimal = (value: Decimal): number => Number(value)