import z from "zod"

/**
 * Pagination Schemas
 *
 * Shared Zod schema for validating pagination query parameters.
 * Centralized here to avoid duplication across categories,
 * transactions, and saving-goals — defaults and limits
 * are defined in a single place.
 *
 * Expected paginated response shape:
 * {
 *   data: T[],
 *   meta: { total, page, limit, totalPages }
 * }
 */

/**
 * Schema for pagination query parameters
 *
 * - page:  1-based page number. Defaults to 1.
 *          z.coerce converts the query string to a number before
 *          validation — Express always receives strings in req.query.
 *
 * - limit: number of records per page. Defaults to 10. Max: 100.
 *          The upper bound of 100 protects the database from
 *          uncontrolled queries (e.g. limit=999999 would cause
 *          an unnecessary full-table scan).
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),

  limit: z.coerce.number().int().positive().max(100).optional().default(10)
})

/**
 * Inferred TypeScript type from paginationSchema.
 * Used in services and repositories to type pagination
 * parameters without manually repeating the definition.
 */
export type PaginationDto = z.infer<typeof paginationSchema>