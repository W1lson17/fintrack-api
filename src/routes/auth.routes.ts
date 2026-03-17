import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

const router: Router = Router();

router.post("/register", validateRequest({ body: registerSchema }), register)
router.post("/login", validateRequest({ body: loginSchema }), login)

export default router;