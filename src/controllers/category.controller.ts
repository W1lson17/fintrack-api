import type { Request, Response } from "express"
import * as categoryService from "../services/category.service.js"
import type { CreateCategoryDto, CategoryParamsDto } from "../schemas/category.schemas.js"

export const createCategory = async (
  req: Request<{}, {}, CreateCategoryDto & { userId: string }>,
  res: Response
) => {
  const { userId, ...data } = req.body
  const result = await categoryService.createCategoryService(data, userId)
  res.status(201).json(result)
}

export const getCategories = async (req: Request, res: Response) => {
  const userId = req.body.userId
  const result = await categoryService.getCategoriesService(userId)
  res.status(200).json(result)
}

export const getCategoryById = async (
  req: Request<CategoryParamsDto>,
  res: Response
) => {
  const userId = req.body.userId
  const result = await categoryService.getCategoryByIdService(req.params.id, userId)
  res.status(200).json(result)
}

export const deleteCategory = async (
  req: Request<CategoryParamsDto>,
  res: Response
) => {
  const userId = req.body.userId
  await categoryService.deleteCategoryService(req.params.id, userId)
  res.status(204).send()
}