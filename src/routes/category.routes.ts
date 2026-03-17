import { Router } from "express"
import { createCategory, deleteCategory, getCategories, getCategoryById } from "../controllers/category.controller.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { createCategorySchema, categoryParamsSchema } from "../schemas/category.schemas.js"

const router: Router = Router()

/**
 * Category Routes
 * 
 * All routes are protected by authenticateToken middleware.
 * Request data is validated with Zod schemas before reaching controllers.
 */

// Create a new category — validates request body
router.post("/", authenticateToken, validateRequest({ body: createCategorySchema }), createCategory)

// Get all categories for the authenticated user
router.get("/", authenticateToken, getCategories)

// Get a single category by ID — validates UUID format in params
router.get("/:id", authenticateToken, validateRequest({ params: categoryParamsSchema }), getCategoryById)

// Delete a category by ID — validates UUID format in params
router.delete("/:id", authenticateToken, validateRequest({ params: categoryParamsSchema }), deleteCategory)

export default router