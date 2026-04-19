import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

const secret = process.env.JWT_SECRET || process.env.APP_JWT_SECRET || "super-secret-key-change-in-production";

function parseExpiresIn(val: string): number {
  const match = val.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 3600;
  const n = parseInt(match[1]!);
  const unit = match[2];
  if (unit === "s") return n;
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 3600;
  if (unit === "d") return n * 86400;
  return 7 * 86400;
}

const expiresInSeconds = parseExpiresIn(process.env.JWT_EXPIRES_IN || "7d");

export async function signToken(payload: { sub: number; email: string }): Promise<{ token: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  const token = await sign({ ...payload, iat: now, exp } as unknown as JWTPayload, secret);
  return { token, expiresAt: new Date(exp * 1000) };
}

export async function verifyToken(token: string): Promise<{ sub: number; email: string }> {
  const payload = await verify(token, secret, "HS256");
  return { sub: payload.sub as number, email: payload.email as string };
}
