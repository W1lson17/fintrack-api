import { prisma } from "../lib/prisma.js"
import type { CreateCategoryDto, TransactionType } from "../schemas/category.schemas.js"

export const createCategory = async (data: CreateCategoryDto, userId: string) => {
  return prisma.category.create({
    data: { ...data, userId }
  })
}

export const findCategoryByNameAndType = async (
  userId: string,
  name: string,
  type: TransactionType
) => {
  return prisma.category.findFirst({
    where: { userId, name, type }
  })
}

export const findCategoriesByUserId = async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
}

export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id }
  })
}

export const deleteCategoryById = async (id: string) => {
  return prisma.category.delete({
    where: { id }
  })
}