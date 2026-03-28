import { prisma } from "../lib/prisma.js"

/**
 * User Repository
 *
 * Handles all database operations for user profile management.
 * Excludes password from all responses — never returned to the client.
 */

/**
 * Finds a user by ID and returns profile data without password.
 */
export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  })
}

/**
 * Updates a user's name by ID.
 * Returns updated profile data without password.
 */
export const updateUserName = async (id: string, name: string) => {
  return prisma.user.update({
    where: { id },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  })
}

/**
 * Updates a user's password by ID.
 * Password must be hashed before calling this function.
 */
export const updateUserPassword = async (id: string, hashedPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  })
}

/**
 * Finds a user's hashed password by ID.
 * Used to verify current password before allowing password change.
 */
export const findUserPasswordById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { password: true }
  })
}

/**
 * Deletes a user account by ID.
 * Cascades to all related data — categories, transactions, saving goals, refresh tokens.
 */
export const deleteUserById = async (id: string) => {
  return prisma.user.delete({
    where: { id }
  })
}