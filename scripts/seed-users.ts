import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { readFileSync } from "fs";

const nims = readFileSync("scripts/nim.txt", "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

console.log(`Seeding ${nims.length} users...`);

const values = await Promise.all(
  nims.map(async (nim) => ({
    nim,
    email: `${nim}@std.stei.itb.ac.id`,
    passwordHash: await Bun.password.hash(nim),
    fullName: `User ${nim}`,
  }))
);

await db.insert(users).values(values).onConflictDoNothing();

console.log("Done.");
process.exit(0);
