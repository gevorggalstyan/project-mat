import "server-only";

import { headers } from "next/headers";
import { UserIdentity } from "./user";
import { env } from "./env";

const CF_EMAIL_HEADER = "cf-access-authenticated-user-email";
const CF_NAME_HEADER = "cf-access-authenticated-user-name";

export async function getUserIdentity(): Promise<UserIdentity | null> {
  const hdrs = await headers();
  const email = hdrs.get(CF_EMAIL_HEADER);
  const name = hdrs.get(CF_NAME_HEADER) ?? undefined;

  if (email) {
    return {
      email,
      name,
      source: "cloudflare",
    };
  }

  // In local development, use fallback identity
  if (env.LOCAL_DEV_IDENTITY_ENABLED && env.LOCAL_DEV_USER_EMAIL) {
    return {
      email: env.LOCAL_DEV_USER_EMAIL,
      name: env.LOCAL_DEV_USER_NAME,
      source: "local",
    };
  }

  // In production without Cloudflare Access, return null
  return null;
}
