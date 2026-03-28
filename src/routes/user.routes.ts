import { Router } from "express"
import { getProfile, updateName, changePassword, deleteAccount } from "../controllers/user.controller.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { updateNameSchema, changePasswordSchema, deleteAccountSchema } from "../schemas/user.schemas.js"

const router: Router = Router()

/**
 * User Routes
 *
 * All routes are protected by authenticateToken middleware.
 * Request data is validated with Zod schemas before reaching controllers.
 */

// Get the authenticated user's profile
router.get("/me", authenticateToken, getProfile)

// Update the authenticated user's name
router.patch("/me/name", authenticateToken, validateRequest({ body: updateNameSchema }), updateName)

// Change the authenticated user's password
router.patch("/me/password", authenticateToken, validateRequest({ body: changePasswordSchema }), changePassword)

// Delete the authenticated user's account — requires password confirmation
router.delete("/me", authenticateToken, validateRequest({ body: deleteAccountSchema }), deleteAccount)

export default router