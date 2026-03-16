import { Hono } from "hono";
import { LoginRequestDto } from "./auth.dto";
import { jsonValidator } from "../../shared/validation/zod-validator";
import * as authController from "./auth.controller";

export const authRouter = new Hono();

authRouter.post("/login", jsonValidator(LoginRequestDto), (c) => authController.login(c));
