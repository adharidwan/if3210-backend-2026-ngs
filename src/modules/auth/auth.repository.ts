import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
  const rows = await db
    .select({
      id: users.id,
      nim: users.nim,
      email: users.email,
      passwordHash: users.passwordHash,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0] ?? null;
}
