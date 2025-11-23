import "server-only";

import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures that all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Local development identity (for bypassing Cloudflare Access)
  LOCAL_DEV_IDENTITY_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  LOCAL_DEV_USER_EMAIL: z.string().optional(),
  LOCAL_DEV_USER_NAME: z.string().optional(),

  // Test page protection
  ENABLE_TEST_DB_PAGE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Invalid environment variables:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid environment variables");
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;
