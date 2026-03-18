declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
      }
      // Stores validated and typed request data
      // Populated by validateRequest middleware
      validated?: {
        body?: unknown
        query?: unknown
        params?: unknown
      }
    }
  }
}

export { }