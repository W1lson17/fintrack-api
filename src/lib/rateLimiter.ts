import rateLimit from "express-rate-limit"

/**
 * Rate Limiters
 *
 * Protect endpoints from brute force attacks and abuse.
 * Returns 429 Too Many Requests when the limit is exceeded.
 * Disabled in test environment to avoid interference with integration tests.
 */

const isTest = process.env.NODE_ENV === "test"

/**
 * General rate limiter — applied to all API routes
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => isTest, // Skip rate limiting in test environment
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later",
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Auth rate limiter — applied to login and register endpoints
 * 10 requests per 15 minutes per IP
 * Stricter limit to prevent brute force attacks on credentials
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => isTest, // Skip rate limiting in test environment
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many authentication attempts, please try again later",
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
})