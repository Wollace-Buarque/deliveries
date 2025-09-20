import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_URL: z.string().url('Invalid FRONTEND_URL').min(1, 'FRONTEND_URL is required'),
  PORT: z.coerce.number().default(3333),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required')
})

const parsedEnv = envSchema.safeParse(process.env)
if (!parsedEnv.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(parsedEnv.error.format(), null, 2)}`)
}

const env = parsedEnv.data
export { env }
