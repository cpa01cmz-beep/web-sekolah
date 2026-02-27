import { z, ZodError } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(64, 'JWT_SECRET must be at least 64 characters for production security')
    .optional(),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  ALLOWED_ORIGINS: z.string().optional(),
  SITE_URL: z.string().url().optional(),
  DEFAULT_PASSWORD: z.string().min(8).optional(),
  GlobalDurableObject: z.any().optional(),
})

export type ValidatedEnv = z.infer<typeof envSchema>

export interface EnvValidationResult {
  success: boolean
  data?: ValidatedEnv
  errors?: ZodError['issues']
}

export function validateEnv(env: Record<string, unknown>): EnvValidationResult {
  const result = envSchema.safeParse(env)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

export function validateEnvStrict(env: Record<string, unknown>): ValidatedEnv {
  const result = envSchema.safeParse(env)

  if (!result.success) {
    const errorMessages = result.error.issues
      .map(
        (e: { path: (string | number)[]; message: string }) => `${e.path.join('.')}: ${e.message}`
      )
      .join(', ')
    throw new Error(`Invalid environment configuration: ${errorMessages}`)
  }

  return result.data
}

export function isProductionEnv(env: Record<string, unknown>): boolean {
  const envValue = env.ENVIRONMENT as string | undefined
  return envValue === 'production'
}

export function isDevelopmentEnv(env: Record<string, unknown>): boolean {
  const envValue = env.ENVIRONMENT as string | undefined
  return envValue === 'development' || !envValue
}
