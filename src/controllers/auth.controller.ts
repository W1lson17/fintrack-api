import type { Request, Response } from "express"
import * as authService from "../services/auth.service.js"
import type { RegisterDto, LoginDto } from "../schemas/auth.schemas.js"

export const register = async (req: Request<{}, {}, RegisterDto>, res: Response) => {
  const result = await authService.register(req.body)
  res.status(201).json(result)
}

export const login = async (req: Request<{}, {}, LoginDto>, res: Response) => {
  const result = await authService.login(req.body)
  res.status(200).json(result)
}