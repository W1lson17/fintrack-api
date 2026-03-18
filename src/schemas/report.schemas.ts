import z from "zod"

/**
 * Report Schemas
 * 
 * Zod schemas for validating report query parameters.
 * Values are coerced from strings since they come from URL query params.
 */

/**
 * Schema for report query parameters
 * 
 * - month: 1-12 — the month to generate the report for
 * - year: 2000+ — the year to generate the report for
 */
export const reportQuerySchema = z.object({
  month: z.coerce.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z.coerce.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(9999, "Invalid year")
})

export type ReportQueryDto = z.infer<typeof reportQuerySchema>