import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import {
  createCategory,
  deleteCategoryById,
  findCategoriesByUserId,
  findCategoryById,
  findCategoryByNameAndType
} from "../repositories/category.repository.js"
import type { CreateCategoryDto, QueryCategoriesDto } from "../schemas/category.schemas.js"

/**
 * Category Service
 *
 * Business logic for category management.
 * Handles duplicate detection and ownership verification.
 */

/**
 * Creates a new category for the authenticated user.
 * Prevents duplicate categories with the same name and type.
 */
export const createCategoryService = async (data: CreateCategoryDto, userId: string) => {
  const existing = await findCategoryByNameAndType(userId, data.name, data.type)
  if (existing) throw new AppError("Category already exists", 409, ERROR_CODES.CATEGORY_ALREADY_EXISTS)

  return createCategory(data, userId)
}

/**
 * Retrieves a paginated list of categories for a user.
 * Pagination params are optional — defaults applied at repository level.
 */
export const getCategoriesService = async (userId: string, params?: QueryCategoriesDto) => {
  return findCategoriesByUserId(userId, params)
}

/**
 * Retrieves a single category by ID.
 * Validates ownership before returning.
 */
export const getCategoryByIdService = async (id: string, userId: string) => {
  const category = await findCategoryById(id)
  if (!category) throw new AppError("Category not found", 404, ERROR_CODES.CATEGORY_NOT_FOUND)
  if (category.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return category
}

/**
 * Deletes a category by ID.
 * Validates ownership before deleting.
 */
export const deleteCategoryService = async (id: string, userId: string) => {
  const category = await findCategoryById(id)
  if (!category) throw new AppError("Category not found", 404, ERROR_CODES.CATEGORY_NOT_FOUND)
  if (category.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return deleteCategoryById(id)
}