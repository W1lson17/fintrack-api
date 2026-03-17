import { Router } from "express"
import { createCategory, deleteCategory, getCategories, getCategoryById } from "../controllers/category.controller.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { createCategorySchema, categoryParamsSchema } from "../schemas/category.schemas.js"

const router: Router = Router()

router.post("/", validateRequest({ body: createCategorySchema }), createCategory)
router.get("/", getCategories)
router.get("/:id", validateRequest({ params: categoryParamsSchema }), getCategoryById)
router.delete("/:id", validateRequest({ params: categoryParamsSchema }), deleteCategory)

export default router