import "server-only";

import { headers } from "next/headers";
import { UserIdentity } from "./user";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { logError } from "./logger";

const CF_EMAIL_HEADER = "cf-access-authenticated-user-email";
const CF_NAME_HEADER = "cf-access-authenticated-user-name";

async function recordUserVisit(user: UserIdentity) {
  try {
    const db = await getDb();
    await db.insert(users).values({
      email: user.email,
      name: user.name,
      source: user.source,
      lastSeenAt: new Date(),
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        name: user.name,
        source: user.source,
        lastSeenAt: new Date(),
      }
    });
  } catch (error) {
    // Don't fail the request if we can't record the visit
    logError(error, "recordUserVisit");
  }
}

export async function getUserIdentity(): Promise<UserIdentity | null> {
  const hdrs = await headers();
  const email = hdrs.get(CF_EMAIL_HEADER);
  const name = hdrs.get(CF_NAME_HEADER) ?? undefined;

  if (email) {
    const user: UserIdentity = {
      email,
      name,
      source: "cloudflare",
    };
    await recordUserVisit(user);
    return user;
  }

  // In local development only (NODE_ENV !== 'production'), use fallback identity
  // This check happens at runtime, not build time
  const isLocalDev = process.env.NODE_ENV !== "production" && 
                     process.env.LOCAL_DEV_IDENTITY_ENABLED === "true";
  
  if (isLocalDev && process.env.LOCAL_DEV_USER_EMAIL) {
    const user: UserIdentity = {
      email: process.env.LOCAL_DEV_USER_EMAIL,
      name: process.env.LOCAL_DEV_USER_NAME,
      source: "local",
    };
    await recordUserVisit(user);
    return user;
  }

  // In production without Cloudflare Access, return null
  return null;
}
