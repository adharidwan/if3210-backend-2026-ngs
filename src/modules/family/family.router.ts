import { Hono } from "hono";
import { authMiddleware } from "../../shared/auth/auth-middleware";
import { jsonValidator } from "../../shared/validation/zod-validator";
import { CreateFamilyRequestDto, JoinFamilyRequestDto, LeaveFamilyRequestDto } from "./family.dto";
import * as familyController from "./family.controller";
import { LivestreamActorRequestDto, LivestreamTokenRequestDto } from "./livestream.dto";
import * as livestreamController from "./livestream.controller";

export const familyRouter = new Hono();

familyRouter.use("/families/*", authMiddleware);
familyRouter.use("/families", authMiddleware);
familyRouter.use("/me/families", authMiddleware);

familyRouter.get("/families", (c) => familyController.listFamilies(c));
familyRouter.get("/me/families", (c) => familyController.listMyFamilies(c));
familyRouter.get("/families/discover", (c) => familyController.listDiscoverFamilies(c));
familyRouter.get("/families/:familyId", (c) => familyController.getFamilyById(c));
familyRouter.post("/families", jsonValidator(CreateFamilyRequestDto), (c) => familyController.createFamily(c));
familyRouter.post("/families/join", jsonValidator(JoinFamilyRequestDto), (c) => familyController.joinFamily(c));
familyRouter.post("/families/leave", jsonValidator(LeaveFamilyRequestDto), (c) => familyController.leaveFamily(c));
familyRouter.get("/families/:familyId/livestreams", (c) => livestreamController.listLivestreamSessions(c));
familyRouter.post(
	"/families/:familyId/livestreams/start",
	jsonValidator(LivestreamActorRequestDto),
	(c) => livestreamController.startLivestream(c)
);
familyRouter.post(
	"/families/:familyId/livestreams/stop",
	jsonValidator(LivestreamActorRequestDto),
	(c) => livestreamController.stopLivestream(c)
);
familyRouter.post(
	"/families/:familyId/livestreams/token",
	jsonValidator(LivestreamTokenRequestDto),
	(c) => livestreamController.issueLivekitToken(c)
);
