import type { Request, Response } from "express"
import * as categoryService from "../services/category.service.js"
import type { CreateCategoryDto, CategoryParamsDto } from "../schemas/category.schemas.js"

/**
 * Category Controllers
 * 
 * Handles HTTP requests for category management.
 * All endpoints require authentication — userId is extracted from JWT via req.user
 */

/**
 * POST /api/categories
 * Creates a new category for the authenticated user
 */
export const createCategory = async (
  req: Request<{}, {}, CreateCategoryDto>,
  res: Response
) => {
  // Extract userId from JWT token — set by authenticateToken middleware
  const userId = req.user!.id
  const result = await categoryService.createCategoryService(req.body, userId)
  res.status(201).json(result)
}

/**
 * GET /api/categories
 * Returns all categories belonging to the authenticated user
 */
export const getCategories = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const result = await categoryService.getCategoriesService(userId)
  res.status(200).json(result)
}

/**
 * GET /api/categories/:id
 * Returns a single category by ID — validates ownership before returning
 */
export const getCategoryById = async (
  req: Request<CategoryParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  const result = await categoryService.getCategoryByIdService(req.params.id, userId)
  res.status(200).json(result)
}

/**
 * DELETE /api/categories/:id
 * Deletes a category by ID — validates ownership before deleting
 * Returns 204 No Content on success
 */
export const deleteCategory = async (
  req: Request<CategoryParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  await categoryService.deleteCategoryService(req.params.id, userId)
  // 204 No Content — successful deletion returns no body
  res.status(204).send()
}