import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import {
  createCategory,
  deleteCategoryById,
  findCategoriesByUserId,
  findCategoryById,
  findCategoryByNameAndType
} from "../repositories/category.repository.js"
import type { CreateCategoryDto } from "../schemas/category.schemas.js"

export const createCategoryService = async (data: CreateCategoryDto, userId: string) => {
  const existing = await findCategoryByNameAndType(userId, data.name, data.type)
  if (existing) throw new AppError("Category already exists", 409, ERROR_CODES.CATEGORY_ALREADY_EXISTS)

  return createCategory(data, userId)
}

export const getCategoriesService = async (userId: string) => {
  return findCategoriesByUserId(userId)
}

export const getCategoryByIdService = async (id: string, userId: string) => {
  const category = await findCategoryById(id)
  if (!category) throw new AppError("Category not found", 404, ERROR_CODES.CATEGORY_NOT_FOUND)
  if (category.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return category
}

export const deleteCategoryService = async (id: string, userId: string) => {
  const category = await findCategoryById(id)
  if (!category) throw new AppError("Category not found", 404, ERROR_CODES.CATEGORY_NOT_FOUND)
  if (category.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return deleteCategoryById(id)
}