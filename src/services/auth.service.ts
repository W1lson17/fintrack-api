import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, findUserByEmail } from "../repositories/auth.repository.js"
import type { RegisterDto, LoginDto } from "../schemas/auth.schemas.js"
import { AppError } from "../lib/AppError.js"
import { ERROR_CODES } from "../lib/errorCodes.js"

const SALT_ROUNDS = 10
const JWT_EXPIRES_IN = "7d"

const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new AppError("JWT_SECRET is not defined", 500, ERROR_CODES.CONFIGURATION_ERROR)

  return jwt.sign({ id: userId, email }, secret, { expiresIn: JWT_EXPIRES_IN })
}

export const register = async (data: RegisterDto) => {
  const existingUser = await findUserByEmail(data.email)
  if (existingUser) throw new AppError("Email is already in use", 409, ERROR_CODES.EMAIL_ALREADY_EXISTS)

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
  const user = await createUser({ ...data, password: hashedPassword })

  const token = generateToken(user.id, user.email)

  return { token }
}

export const login = async (data: LoginDto) => {
  const user = await findUserByEmail(data.email)
  if (!user) throw new AppError("Invalid email or password", 401, ERROR_CODES.INVALID_CREDENTIALS)

  const isPasswordValid = await bcrypt.compare(data.password, user.password)
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401, ERROR_CODES.INVALID_CREDENTIALS)

  const token = generateToken(user.id, user.email)

  return { token }
}