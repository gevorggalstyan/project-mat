import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";
import type { MyCloudflareEnv } from "../../cloudflare-env";

export async function getDb() {
  try {
    // getCloudflareContext() throws or returns undefined in environments where it's not available
    const ctx = (await getCloudflareContext()) as unknown as {
      env: MyCloudflareEnv;
    };
    if (ctx?.env?.DB) {
      return drizzle(ctx.env.DB, { schema });
    }
  } catch (e) {
    console.log("Cloudflare context not available, using local DB");
  }

  console.warn("Falling back to local SQLite database 'local.sqlite'");

  // Dynamic import to avoid bundling better-sqlite3 in Cloudflare Worker
  const { drizzle: drizzleSqlite } = await import("drizzle-orm/better-sqlite3");
  const Database = (await import("better-sqlite3")).default;

  const sqlite = new Database("local.sqlite");
  return drizzleSqlite(sqlite, { schema });
}
