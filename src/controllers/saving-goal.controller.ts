import type { Request, Response } from "express"
import * as savingGoalService from "../services/saving-goal.service.js"
import type { CreateSavingGoalDto, QuerySavingGoalsDto, SavingGoalParamsDto, UpdateSavingGoalDto } from "../schemas/saving-goal.schemas.js"

/**
 * Saving Goal Controllers
 * 
 * Handles HTTP requests for saving goal management.
 * All endpoints require authentication — userId is extracted from JWT via req.user
 */

/**
 * POST /api/saving-goals
 * Creates a new saving goal for the authenticated user
 */
export const createSavingGoal = async (
  req: Request<{}, {}, CreateSavingGoalDto>,
  res: Response
) => {
  // Extract userId from JWT token — set by authenticateToken middleware
  const userId = req.user!.id
  const result = await savingGoalService.createSavingGoalService(req.body, userId)
  res.status(201).json(result)
}

/**
 * GET /api/saving-goals
 * Returns a paginated list of saving goals for the authenticated user.
 * Accepts optional query params: page, limit.
 * Pagination params are validated and injected by validateRequest middleware via req.validated.
 */
export const getSavingGoals = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const params = req.validated?.query as QuerySavingGoalsDto

  const { data, total } = await savingGoalService.getSavingGoalsService(userId, params)

  const page = params?.page ?? 1
  const limit = params?.limit ?? 10

  res.status(200).json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

/**
 * GET /api/saving-goals/:id
 * Returns a single saving goal by ID — validates ownership before returning
 */
export const getSavingGoalById = async (
  req: Request<SavingGoalParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  const result = await savingGoalService.getSavingGoalByIdService(req.params.id, userId)
  res.status(200).json(result)
}

/**
 * PATCH /api/saving-goals/:id
 * Updates the current amount of a saving goal
 * Validates that the new amount doesn't exceed the target
 */
export const updateSavingGoal = async (
  req: Request<SavingGoalParamsDto, {}, UpdateSavingGoalDto>,
  res: Response
) => {
  const userId = req.user!.id
  const result = await savingGoalService.updateSavingGoalService(req.params.id, req.body, userId)
  res.status(200).json(result)
}

/**
 * DELETE /api/saving-goals/:id
 * Deletes a saving goal by ID — validates ownership before deleting
 * Returns 204 No Content on success
 */
export const deleteSavingGoal = async (
  req: Request<SavingGoalParamsDto>,
  res: Response
) => {
  const userId = req.user!.id
  await savingGoalService.deleteSavingGoalService(req.params.id, userId)
  // 204 No Content — successful deletion returns no body
  res.status(204).send()
}