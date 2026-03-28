import { type NextFunction, type Request, type Response } from "express"
import { ZodError, type ZodType } from "zod"

/**
 * Request Validation Middleware
 * 
 * Validates incoming request data against Zod schemas.
 * Supports validation of body, params and query parameters.
 * Returns 400 with detailed field errors if validation fails.
 * 
 * Usage:
 * validateRequest({ body: schema })           — validates request body
 * validateRequest({ params: schema })         — validates route params
 * validateRequest({ query: schema })          — validates query params
 * validateRequest({ body: s1, params: s2 })   — validates multiple sources
 * 
 * Note on type safety:
 * Query params are stored in req.validated to avoid Express type conflicts.
 * Body and params mutate req directly as Express supports their generic types.
 * Runtime safety is guaranteed by Zod validation before any cast occurs.
 */

interface ValidationSchemas {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body)
        req.body = parsed
        req.validated = { ...req.validated, body: parsed }
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>
      }
      if (schemas.query) {
        // Store in req.validated to avoid Express type conflicts with ParsedQs
        // Zod coerces types correctly (e.g. string -> number via z.coerce)
        req.validated = { query: schemas.query.parse(req.query) }
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "error",
          code: "VALIDATION_ERROR",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        })
        return
      }
      // Pass non-validation errors to the global error handler
      next(error)
    }
  }
}