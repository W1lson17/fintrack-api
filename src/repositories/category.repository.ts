import { TransactionType } from "../lib/constants.js"
import { prisma } from "../lib/prisma.js"
import type { CreateCategoryDto, QueryCategoriesDto } from "../schemas/category.schemas.js"

/**
 * Category Repository
 * 
 * Handles all database operations for categories.
 * Uses Prisma ORM for type-safe database access.
 */

/**
 * Creates a new category associated with a user
 */
export const createCategory = async (data: CreateCategoryDto, userId: string) => {
  return prisma.category.create({
    data: { ...data, userId }
  })
}

/**
 * Finds a category by name and type for a specific user
 * Used to prevent duplicate categories for the same user
 */
export const findCategoryByNameAndType = async (
  userId: string,
  name: string,
  type: TransactionType
) => {
  return prisma.category.findFirst({
    where: { userId, name, type }
  })
}

/**
 * Retrieves all categories for a user
 * Ordered by creation date — most recent first
 *
 * Returns both the paginated data and the total count for meta calculation.
 */
export const findCategoriesByUserId = async (userId: string, params?: QueryCategoriesDto) => {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 10
  const skip = (page - 1) * limit

  const where = { userId }

  // Run both queries in parallel for efficiency
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.category.count({ where })
  ])

  return { data: categories, total }
}

/**
 * Finds a single category by its ID
 */
export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id }
  })
}

/**
 * Deletes a category by its ID
 * Note: Will fail if category has associated transactions (onDelete: Restrict)
 */
export const deleteCategoryById = async (id: string) => {
  return prisma.category.delete({
    where: { id }
  })
}