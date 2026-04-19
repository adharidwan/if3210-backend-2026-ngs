import { createHmac, randomBytes } from "crypto";
import { findFamilyDetail, isFamilyMember } from "./family.repository";
import { findUserById } from "../profile/profile.repository";
import {
  LivestreamConflictServiceError,
  LivestreamConfigurationServiceError,
  LivestreamForbiddenServiceError,
  LivestreamNotFoundServiceError,
  LivestreamValidationServiceError,
} from "./livestream.error";
import {
  createLivestreamSession,
  findActiveLivestreamSessionByFamilyId,
  listLivestreamSessionsByFamilyId,
  stopLivestreamSession,
  type LivestreamSessionRow,
} from "./livestream.repository";

export type LivestreamSessionResponse = {
  streamId: string;
  familyId: number;
  hostUserId: string;
  hostDisplayName: string;
  startedAtMs: number;
  stoppedAtMs: number | null;
  isActive: boolean;
};

export type LivestreamTokenResponse = {
  roomName: string;
  participantName: string;
  rtcUrl: string;
  token: string;
  role: "host" | "viewer";
  provider: string;
  expiresAtEpochSeconds: number;
};

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;

function base64UrlEncode(input: string | Buffer) {
  const base64 = typeof input === "string" ? Buffer.from(input).toString("base64") : input.toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function signHs256Jwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest();
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

function getLiveKitConfig() {
  const rtcUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!rtcUrl || !apiKey || !apiSecret) {
    throw new LivestreamConfigurationServiceError(
      "LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be configured"
    );
  }

  return { rtcUrl, apiKey, apiSecret };
}

function generateStreamId() {
  return `ls_${Date.now().toString(36)}${randomBytes(8).toString("hex")}`;
}

function toSessionResponse(session: LivestreamSessionRow): LivestreamSessionResponse {
  return {
    streamId: session.streamId,
    familyId: session.familyId,
    hostUserId: String(session.hostUserId),
    hostDisplayName: session.hostDisplayName,
    startedAtMs: session.startedAt.getTime(),
    stoppedAtMs: session.stoppedAt ? session.stoppedAt.getTime() : null,
    isActive: session.stoppedAt === null,
  };
}

async function requireFamilyMember(familyId: number, userId: number) {
  const family = await findFamilyDetail(familyId);
  if (!family) {
    throw new LivestreamNotFoundServiceError("Family not found");
  }

  const member = await isFamilyMember(familyId, userId);
  if (!member) {
    throw new LivestreamForbiddenServiceError("You are not allowed to access this family livestream");
  }

  return family;
}

async function resolveUserDisplayName(userId: number) {
  const user = await findUserById(userId);
  return user?.fullName ?? `User ${userId}`;
}

function resolveRequestedUserId(userId: number, requestedUserId?: number) {
  if (requestedUserId === undefined) return userId;
  if (requestedUserId !== userId) {
    throw new LivestreamValidationServiceError("hostUserId must match the authenticated user");
  }
  return requestedUserId;
}

export async function listLivestreamSessions(familyId: number, userId: number) {
  await requireFamilyMember(familyId, userId);
  const sessions = await listLivestreamSessionsByFamilyId(familyId);
  return sessions
    .map(toSessionResponse)
    .sort((left, right) => {
      if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
      return right.startedAtMs - left.startedAtMs;
    });
}

export async function startLivestream(familyId: number, userId: number, requestedHostUserId?: number) {
  await requireFamilyMember(familyId, userId);
  const hostUserId = resolveRequestedUserId(userId, requestedHostUserId);
  const activeSession = await findActiveLivestreamSessionByFamilyId(familyId);
  if (activeSession) {
    throw new LivestreamConflictServiceError("A livestream session is already active for this family");
  }

  const hostDisplayName = await resolveUserDisplayName(hostUserId);
  const session = await createLivestreamSession({
    streamId: generateStreamId(),
    familyId,
    hostUserId,
    hostDisplayName,
    startedAt: new Date(),
    stoppedAt: null,
  });

  return toSessionResponse(session);
}

export async function stopLivestream(familyId: number, userId: number, requestedHostUserId?: number) {
  await requireFamilyMember(familyId, userId);
  const hostUserId = resolveRequestedUserId(userId, requestedHostUserId);
  const activeSession = await findActiveLivestreamSessionByFamilyId(familyId);
  if (!activeSession) {
    throw new LivestreamConflictServiceError("There is no active livestream session for this family");
  }
  if (activeSession.hostUserId !== hostUserId) {
    throw new LivestreamForbiddenServiceError("Only the active host can stop this livestream");
  }

  const stopped = await stopLivestreamSession(activeSession.streamId, new Date());
  if (!stopped) {
    throw new LivestreamNotFoundServiceError("Livestream session not found");
  }

  return toSessionResponse(stopped);
}

export async function issueLivekitToken(
  familyId: number,
  userId: number,
  role: "host" | "viewer",
  requestedHostUserId?: number
): Promise<LivestreamTokenResponse> {
  await requireFamilyMember(familyId, userId);
  resolveRequestedUserId(userId, requestedHostUserId);

  const user = await findUserById(userId);
  const participantName = user?.fullName ?? `User ${userId}`;
  const { rtcUrl, apiKey, apiSecret } = getLiveKitConfig();
  const now = Math.floor(Date.now() / 1000);
  const expiresAtEpochSeconds = now + DEFAULT_TOKEN_TTL_SECONDS;
  const roomName = `family-${familyId}-live`;
  const token = signHs256Jwt(
    {
      iss: apiKey,
      sub: String(userId),
      nbf: now,
      exp: expiresAtEpochSeconds,
      name: participantName,
      video: {
        roomJoin: true,
        room: roomName,
        canPublish: role === "host",
        canSubscribe: true,
        canPublishData: role === "host",
      },
    },
    apiSecret
  );

  return {
    roomName,
    participantName,
    rtcUrl,
    token,
    role,
    provider: process.env.LIVESTREAM_PROVIDER || "livekit_cloud",
    expiresAtEpochSeconds,
  };
}
