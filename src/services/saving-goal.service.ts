import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"
import {
  createSavingGoal,
  deleteSavingGoalById,
  findSavingGoalById,
  findSavingGoalsByUserId,
  updateSavingGoalAmount
} from "../repositories/saving-goal.repository.js"
import type { CreateSavingGoalDto, UpdateSavingGoalDto } from "../schemas/saving-goal.schemas.js"

/**
 * Saving Goal Service
 * 
 * Business logic for saving goal management.
 * Handles ownership verification and progress validation.
 */

/**
 * Creates a new saving goal for the authenticated user
 */
export const createSavingGoalService = async (data: CreateSavingGoalDto, userId: string) => {
  return createSavingGoal(data, userId)
}

/**
 * Retrieves all saving goals for a user
 */
export const getSavingGoalsService = async (userId: string) => {
  return findSavingGoalsByUserId(userId)
}

/**
 * Retrieves a single saving goal by ID
 * Validates ownership before returning
 */
export const getSavingGoalByIdService = async (id: string, userId: string) => {
  const savingGoal = await findSavingGoalById(id)
  if (!savingGoal) throw new AppError("Saving goal not found", 404, ERROR_CODES.SAVING_GOAL_NOT_FOUND)

  // Prevent users from accessing other users' saving goals
  if (savingGoal.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return savingGoal
}

/**
 * Updates the current amount of a saving goal
 * Validates ownership and ensures amount doesn't exceed target
 */
export const updateSavingGoalService = async (id: string, data: UpdateSavingGoalDto, userId: string) => {
  const savingGoal = await findSavingGoalById(id)
  if (!savingGoal) throw new AppError("Saving goal not found", 404, ERROR_CODES.SAVING_GOAL_NOT_FOUND)

  // Prevent users from updating other users' saving goals
  if (savingGoal.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  // Ensure the new amount doesn't exceed the target
  const newAmount = Number(savingGoal.currentAmount) + data.amount
  if (newAmount > Number(savingGoal.targetAmount)) {
    throw new AppError(
      `Amount exceeds target by ${newAmount - Number(savingGoal.targetAmount)}`,
      400,
      ERROR_CODES.AMOUNT_EXCEEDS_TARGET
    )
  }

  return updateSavingGoalAmount(id, data)
}

/**
 * Deletes a saving goal by ID
 * Validates ownership before deleting
 */
export const deleteSavingGoalService = async (id: string, userId: string) => {
  const savingGoal = await findSavingGoalById(id)
  if (!savingGoal) throw new AppError("Saving goal not found", 404, ERROR_CODES.SAVING_GOAL_NOT_FOUND)

  // Prevent users from deleting other users' saving goals
  if (savingGoal.userId !== userId) throw new AppError("Unauthorized", 403, ERROR_CODES.UNAUTHORIZED)

  return deleteSavingGoalById(id)
}