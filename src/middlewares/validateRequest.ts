import type { NextFunction, Request, Response } from "express"
import { ZodError, ZodType } from "zod"

interface ValidationSchemas {
  body?: ZodType
  params?: ZodType
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
        return
      }
      next(error)
    }
  }
}