import type { Context } from "hono";
import * as livestreamService from "./livestream.service";
import {
  LivestreamConflictServiceError,
  LivestreamConfigurationServiceError,
  LivestreamForbiddenServiceError,
  LivestreamNotFoundServiceError,
  LivestreamValidationServiceError,
} from "./livestream.error";
import {
  BadRequestHttpException,
  ConflictHttpException,
  ForbiddenHttpException,
  InternalServerErrorHttpException,
  NotFoundHttpException,
} from "../../shared/http/http-exception";

function mapError(e: unknown): never {
  if (e instanceof LivestreamNotFoundServiceError) throw new NotFoundHttpException(e.message);
  if (e instanceof LivestreamForbiddenServiceError) throw new ForbiddenHttpException(e.message);
  if (e instanceof LivestreamConflictServiceError) throw new ConflictHttpException(e.message);
  if (e instanceof LivestreamValidationServiceError) throw new BadRequestHttpException(e.message);
  if (e instanceof LivestreamConfigurationServiceError) throw new InternalServerErrorHttpException(e.message);
  throw e;
}

function parseFamilyId(c: Context) {
  const familyId = parseInt(c.req.param("familyId") ?? "");
  if (Number.isNaN(familyId)) {
    throw new BadRequestHttpException("Invalid family ID");
  }
  return familyId;
}

export async function listLivestreamSessions(c: Context) {
  const familyId = parseFamilyId(c);
  try {
    const data = await livestreamService.listLivestreamSessions(familyId, c.get("userId" as never) as number);
    return c.json({ data });
  } catch (e) {
    mapError(e);
  }
}

export async function startLivestream(c: Context) {
  const familyId = parseFamilyId(c);
  const body = c.req.valid("json" as never) as { hostUserId?: number };
  try {
    const data = await livestreamService.startLivestream(
      familyId,
      c.get("userId" as never) as number,
      body.hostUserId
    );
    return c.json({ data });
  } catch (e) {
    mapError(e);
  }
}

export async function stopLivestream(c: Context) {
  const familyId = parseFamilyId(c);
  const body = c.req.valid("json" as never) as { hostUserId?: number };
  try {
    const data = await livestreamService.stopLivestream(
      familyId,
      c.get("userId" as never) as number,
      body.hostUserId
    );
    return c.json({ data });
  } catch (e) {
    mapError(e);
  }
}

export async function issueLivekitToken(c: Context) {
  const familyId = parseFamilyId(c);
  const body = c.req.valid("json" as never) as { role: "host" | "viewer"; hostUserId?: number };
  try {
    const data = await livestreamService.issueLivekitToken(
      familyId,
      c.get("userId" as never) as number,
      body.role,
      body.hostUserId
    );
    return c.json({ data });
  } catch (e) {
    mapError(e);
  }
}
