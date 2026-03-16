import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function findUserById(userId: number) {
  const rows = await db
    .select({
      id: users.id,
      nim: users.nim,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateUserFullName(userId: number, fullName: string) {
  const rows = await db
    .update(users)
    .set({ fullName, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      nim: users.nim,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
  return rows[0] ?? null;
}
