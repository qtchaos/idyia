/**
 * Usage:
 *   bun run scripts/create-admin.ts <email> <password>
 *   bun run scripts/create-admin.ts admin@idyia.com mysecurepass
 *
 * Also supports prompting:
 *   bun run scripts/create-admin.ts --prompt
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { hashPassword } from "@better-auth/utils/password";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/server/db/schema.ts";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

let email: string;
let password: string;

if (process.argv.includes("--prompt")) {
  const readline = await import("readline/promises");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  email = await rl.question("Email: ");
  password = await rl.question("Password: ");
  rl.close();
} else if (process.argv.length >= 4) {
  email = process.argv[2];
  password = process.argv[3];
} else {
  console.log("Usage: bun run scripts/create-admin.ts <email> <password>");
  console.log("   or: bun run scripts/create-admin.ts --prompt");
  process.exit(1);
}

if (!email || !password) {
  console.error("Email and password are required.");
  process.exit(1);
}

const existing = await db
  .select({ id: schema.user.id })
  .from(schema.user)
  .where(eq(schema.user.email, email))
  .get();

if (existing) {
  // User exists — ensure they have the admin role
  await db
    .insert(schema.userRole)
    .values({ userId: existing.id, role: "admin" })
    .onConflictDoUpdate({ target: schema.userRole.userId, set: { role: "admin" } });
  console.log(`✓  User ${email} already exists — role set to admin`);
} else {
  const userId = crypto.randomUUID();
  const hashed = await hashPassword(password);

  await db.insert(schema.user).values({
    id: userId,
    name: email.split("@")[0],
    email,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(schema.userRole).values({ userId, role: "admin" });

  console.log(`✓  Created admin account: ${email}`);
}

process.exit(0);
