import { createApiResponse } from '@deliveries/shared'
import { FastifyReply, FastifyRequest } from 'fastify'

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send(createApiResponse({ success: false, error: 'Unauthorized' }))
  }
}

export { authenticate }
