import { z } from "zod";

/** The worker fails at start-up, not on its first job, if its env is wrong. */
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => ` • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `\nInvalid environment variables:\n${details}\n\n` +
        `Check apps/worker/.env against apps/worker/.env.example\n`,
    );
  }
  return result.data;
}
