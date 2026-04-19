import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import { livestreamSessions } from "../../db/schema";

export type LivestreamSessionRow = {
  streamId: string;
  familyId: number;
  hostUserId: number;
  hostDisplayName: string;
  startedAt: Date;
  stoppedAt: Date | null;
};

export async function listLivestreamSessionsByFamilyId(familyId: number): Promise<LivestreamSessionRow[]> {
  return db
    .select({
      streamId: livestreamSessions.streamId,
      familyId: livestreamSessions.familyId,
      hostUserId: livestreamSessions.hostUserId,
      hostDisplayName: livestreamSessions.hostDisplayName,
      startedAt: livestreamSessions.startedAt,
      stoppedAt: livestreamSessions.stoppedAt,
    })
    .from(livestreamSessions)
    .where(eq(livestreamSessions.familyId, familyId))
    .orderBy(desc(livestreamSessions.startedAt));
}

export async function findActiveLivestreamSessionByFamilyId(familyId: number): Promise<LivestreamSessionRow | null> {
  const rows = await db
    .select({
      streamId: livestreamSessions.streamId,
      familyId: livestreamSessions.familyId,
      hostUserId: livestreamSessions.hostUserId,
      hostDisplayName: livestreamSessions.hostDisplayName,
      startedAt: livestreamSessions.startedAt,
      stoppedAt: livestreamSessions.stoppedAt,
    })
    .from(livestreamSessions)
    .where(and(eq(livestreamSessions.familyId, familyId), isNull(livestreamSessions.stoppedAt)))
    .orderBy(desc(livestreamSessions.startedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function createLivestreamSession(session: LivestreamSessionRow): Promise<LivestreamSessionRow> {
  const rows = await db
    .insert(livestreamSessions)
    .values(session)
    .returning({
      streamId: livestreamSessions.streamId,
      familyId: livestreamSessions.familyId,
      hostUserId: livestreamSessions.hostUserId,
      hostDisplayName: livestreamSessions.hostDisplayName,
      startedAt: livestreamSessions.startedAt,
      stoppedAt: livestreamSessions.stoppedAt,
    });
  return rows[0]!;
}

export async function stopLivestreamSession(streamId: string, stoppedAt: Date): Promise<LivestreamSessionRow | null> {
  const rows = await db
    .update(livestreamSessions)
    .set({ stoppedAt })
    .where(eq(livestreamSessions.streamId, streamId))
    .returning({
      streamId: livestreamSessions.streamId,
      familyId: livestreamSessions.familyId,
      hostUserId: livestreamSessions.hostUserId,
      hostDisplayName: livestreamSessions.hostDisplayName,
      startedAt: livestreamSessions.startedAt,
      stoppedAt: livestreamSessions.stoppedAt,
    });
  return rows[0] ?? null;
}
