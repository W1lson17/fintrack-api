import { prisma } from "../lib/prisma.js"
import { formatDecimal } from "../lib/formatters.js"
import type { CreateSavingGoalDto, UpdateSavingGoalDto } from "../schemas/saving-goal.schemas.js"

/**
 * Saving Goal Repository
 * 
 * Handles all database operations for saving goals.
 * Uses Prisma ORM for type-safe database access.
 */

/**
 * Creates a new saving goal associated with a user
 * currentAmount defaults to 0 — defined in Prisma schema
 */
export const createSavingGoal = async (data: CreateSavingGoalDto, userId: string) => {
  const goal = await prisma.savingGoal.create({
    data: { ...data, userId }
  })
  return { ...goal, targetAmount: formatDecimal(goal.targetAmount), currentAmount: formatDecimal(goal.currentAmount) }
}

/**
 * Retrieves all saving goals for a user
 * Ordered by creation date — most recent first
 */
export const findSavingGoalsByUserId = async (userId: string) => {
  const goals = await prisma.savingGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
  return goals.map(goal => ({ ...goal, targetAmount: formatDecimal(goal.targetAmount), currentAmount: formatDecimal(goal.currentAmount) }))
}

/**
 * Finds a single saving goal by its ID
 */
export const findSavingGoalById = async (id: string) => {
  const goal = await prisma.savingGoal.findUnique({
    where: { id }
  })
  // Return null if goal not found — service handles the not found error
  if (!goal) return null
  return { ...goal, targetAmount: formatDecimal(goal.targetAmount), currentAmount: formatDecimal(goal.currentAmount) }
}

/**
 * Adds an amount to the saving goal's current progress
 * Uses Prisma's increment to safely add without race conditions
 */
export const updateSavingGoalAmount = async (id: string, data: UpdateSavingGoalDto) => {
  const goal = await prisma.savingGoal.update({
    where: { id },
    data: {
      // increment safely adds to existing value instead of overwriting
      currentAmount: { increment: data.amount }
    }
  })
  return { ...goal, targetAmount: formatDecimal(goal.targetAmount), currentAmount: formatDecimal(goal.currentAmount) }
}

/**
 * Deletes a saving goal by its ID
 */
export const deleteSavingGoalById = async (id: string) => {
  return prisma.savingGoal.delete({
    where: { id }
  })
}