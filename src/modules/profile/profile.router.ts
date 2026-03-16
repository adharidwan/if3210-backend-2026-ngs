import { Hono } from "hono";
import { authMiddleware } from "../../shared/auth/auth-middleware";
import { jsonValidator } from "../../shared/validation/zod-validator";
import { UpdateMeRequestDto } from "./profile.dto";
import * as profileController from "./profile.controller";

export const profileRouter = new Hono();

profileRouter.use("/me", authMiddleware);
profileRouter.get("/me", (c) => profileController.getMe(c));
profileRouter.patch("/me", jsonValidator(UpdateMeRequestDto), (c) => profileController.updateMe(c));
