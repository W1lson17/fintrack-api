// src/routes/auth.routes.ts

import { Router } from "express"
import { register, login, refresh, logout } from "../controllers/auth.controller.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from "../schemas/auth.schemas.js"

const router: Router = Router()

/**
 * Auth Routes
 *
 * Public routes — no authentication required.
 * All request bodies are validated with Zod schemas before reaching controllers.
 */

// Register a new user account
router.post("/register", validateRequest({ body: registerSchema }), register)

// Authenticate and receive access + refresh tokens
router.post("/login", validateRequest({ body: loginSchema }), login)

// Rotate refresh token — returns new access + refresh tokens
router.post("/refresh", validateRequest({ body: refreshTokenSchema }), refresh)

// Invalidate refresh token — ends current session
router.post("/logout", validateRequest({ body: logoutSchema }), logout)

export default router