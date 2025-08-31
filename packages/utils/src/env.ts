import { z } from 'zod';

const boolean = (def = false) =>
  z
    .string()
    .transform((v: string) =>
      v === 'true' || v === '1' ? true : v === 'false' || v === '0' ? false : (v as unknown),
    )
    .pipe(z.boolean())
    .catch(def);

const nonEmpty = (name: string) => z.string().min(1, `${name} is required`);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Public (se exponen al cliente: deben iniciar con NEXT_PUBLIC_)
    NEXT_PUBLIC_SITE_HOST: nonEmpty('NEXT_PUBLIC_SITE_HOST'), // p.ej. example.com:3000
    NEXT_PUBLIC_ANALYTICS: z.enum(['none', 'plausible', 'posthog']).default('none'),

    // Server-only
    CMS_BASE_URL: nonEmpty('CMS_BASE_URL'), // p.ej. https://cms.example.com
    CMS_API_KEY: z.string().optional(),

    // Telemetría opcional
    SENTRY_DSN: z.string().optional(),
    POSTHOG_KEY: z.string().optional(),
    PLAUSIBLE_DOMAIN: z.string().optional(),

    // S3 público (si aplica)
    S3_PUBLIC_BASE_URL: z.string().url().optional(),

    // Feature flags
    ENABLE_LEADS_RATE_LIMIT: boolean(true),
  })
  .superRefine((vals, ctx) => {
    if (vals.NEXT_PUBLIC_SITE_HOST.includes('http')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXT_PUBLIC_SITE_HOST must be host:port (sin http/https).',
        path: ['NEXT_PUBLIC_SITE_HOST'],
      });
    }
    try {
      new URL(vals.CMS_BASE_URL);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CMS_BASE_URL debe ser URL absoluta válida.',
        path: ['CMS_BASE_URL'],
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
  const result = EnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_HOST: process.env.NEXT_PUBLIC_SITE_HOST,
    NEXT_PUBLIC_ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS,
    CMS_BASE_URL: process.env.CMS_BASE_URL,
    CMS_API_KEY: process.env.CMS_API_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
    S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
    ENABLE_LEADS_RATE_LIMIT: process.env.ENABLE_LEADS_RATE_LIMIT,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((i: z.ZodIssue) => `• ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    if (typeof window === 'undefined') {
      throw new Error(`Invalid environment variables:\n${issues}`);
    } else {
      console.warn('[env] Invalid environment variables:\n' + issues);
    }
    return {
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_HOST: 'localhost:3000',
      NEXT_PUBLIC_ANALYTICS: 'none',
      CMS_BASE_URL: 'http://localhost:8000',
      ENABLE_LEADS_RATE_LIMIT: true,
    } as Env;
  }

  return result.data;
}

export const env = parseEnv();
