import type { Context } from "hono";
import * as profileService from "./profile.service";
import { ProfileNotFoundServiceError } from "./profile.error";
import { NotFoundHttpException } from "../../shared/http/http-exception";

export async function getMe(c: Context) {
  try {
    const data = await profileService.getProfile(c.get("userId" as never) as number);
    return c.json({ data });
  } catch (e) {
    if (e instanceof ProfileNotFoundServiceError) throw new NotFoundHttpException(e.message);
    throw e;
  }
}

export async function updateMe(c: Context) {
  const body = c.req.valid("json" as never) as { fullName: string };
  try {
    const data = await profileService.updateProfile(c.get("userId" as never) as number, body.fullName);
    return c.json({ data });
  } catch (e) {
    if (e instanceof ProfileNotFoundServiceError) throw new NotFoundHttpException(e.message);
    throw e;
  }
}
