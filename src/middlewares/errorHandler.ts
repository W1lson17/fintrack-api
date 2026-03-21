import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/AppError.js'
import { logger } from '../lib/logger.js'

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    logger.warn('Controlled error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    })

    res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
    })
    return
  }

  const unknownError = error instanceof Error ? error : new Error(String(error))

  logger.error('Unhandled error', {
    message: unknownError.message,
    stack: unknownError.stack,
  })

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}