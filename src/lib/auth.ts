import "server-only";

import { headers } from "next/headers";
import { UserIdentity } from "./user";

const CF_EMAIL_HEADER = "cf-access-authenticated-user-email";
const CF_NAME_HEADER = "cf-access-authenticated-user-name";

const FALLBACK_EMAIL = process.env.LOCAL_DEV_USER_EMAIL;
const FALLBACK_NAME = process.env.LOCAL_DEV_USER_NAME;
const LOCAL_IDENTITY_ENABLED =
  process.env.LOCAL_DEV_IDENTITY_ENABLED === "true";

export async function getUserIdentity(): Promise<UserIdentity> {
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

  if (!LOCAL_IDENTITY_ENABLED) {
    throw new Error(
      "Missing Cloudflare headers and LOCAL_DEV_IDENTITY_ENABLED is not 'true'. Enable it in .env.local for local development only."
    );
  }

  if (!FALLBACK_EMAIL) {
    throw new Error(
      "LOCAL_DEV_USER_EMAIL is missing. Create .env.local with LOCAL_DEV_USER_EMAIL and LOCAL_DEV_USER_NAME and set LOCAL_DEV_IDENTITY_ENABLED=true."
    );
  }

  return {
    email: FALLBACK_EMAIL,
    name: FALLBACK_NAME,
    source: "local",
  };
}
