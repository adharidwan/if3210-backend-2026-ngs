import type { Context } from "hono";
import * as authService from "./auth.service";
import { InvalidCredentialsServiceError } from "./auth.error";
import { UnauthorizedHttpException } from "../../shared/http/http-exception";

export async function login(c: Context) {
  const body = c.req.valid("json" as never);
  try {
    const data = await authService.login((body as any).email, (body as any).password);
    return c.json({ data }, 200);
  } catch (e) {
    if (e instanceof InvalidCredentialsServiceError) throw new UnauthorizedHttpException(e.message);
    throw e;
  }
}
