import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";
import type { MyCloudflareEnv } from "../../cloudflare-env";

export async function getDb() {
  const ctx = (await getCloudflareContext()) as unknown as {
    env: MyCloudflareEnv;
  };
  
  if (!ctx?.env?.DB) {
    throw new Error(
      "D1 Database binding (DB) not found. Ensure you are running in a compatible environment (Wrangler or OpenNext with D1 emulation)."
    );
  }

  return drizzle(ctx.env.DB, { schema });
}
