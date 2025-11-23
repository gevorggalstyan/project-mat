import { D1Database, R2Bucket } from "@cloudflare/workers-types";

export interface MyCloudflareEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  [key: string]: unknown;
}
