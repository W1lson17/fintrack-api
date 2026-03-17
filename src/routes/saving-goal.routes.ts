import { Router } from "express"
import { validateRequest } from "../middlewares/validateRequest.js"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { createSavingGoalSchema, savingGoalParamsSchema, updateSavingGoalSchema } from "../schemas/saving-goal.schemas.js"
import { createSavingGoal, deleteSavingGoal, getSavingGoalById, getSavingGoals, updateSavingGoal } from "../controllers/saving-goal.controller.js"

/**
 * Saving Goal Routes
 * 
 * All routes are protected by authenticateToken middleware.
 * Request data is validated with Zod schemas before reaching controllers.
 */

const router: Router = Router()

// Create a new saving goal — validates request body
router.post("/", authenticateToken, validateRequest({ body: createSavingGoalSchema }), createSavingGoal)

// Get all saving goals for the authenticated user
router.get("/", authenticateToken, getSavingGoals)

// Get a single saving goal by ID — validates UUID format in params
router.get("/:id", authenticateToken, validateRequest({ params: savingGoalParamsSchema }), getSavingGoalById)

// Update saving goal progress — validates both params and body
// Uses PATCH instead of PUT — partial update, only modifies currentAmount
router.patch("/:id", authenticateToken, validateRequest({ params: savingGoalParamsSchema, body: updateSavingGoalSchema }), updateSavingGoal)

// Delete a saving goal by ID — validates UUID format in params
router.delete("/:id", authenticateToken, validateRequest({ params: savingGoalParamsSchema }), deleteSavingGoal)

export default router