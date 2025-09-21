import { FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error)

    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        message: error.message,
        details: z.flattenError(error)
      })
    }

    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    })
  })
}
