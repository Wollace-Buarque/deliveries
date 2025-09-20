import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { FastifyInstance } from 'fastify'
import { env } from '@/env'

export async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true
  })

  await fastify.register(helmet)

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  })

  await fastify.register(jwt, {
    secret: env.JWT_SECRET
  })

  await fastify.register(multipart)
}
