import { prisma } from "../lib/prisma.js";
import { RegisterDto } from "../schemas/auth.schemas.js";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  })
}

export const createUser = async (data: RegisterDto) => {
  return prisma.user.create({
    data
  })
}