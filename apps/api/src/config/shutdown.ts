import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@generated/prisma'

export function registerShutdown(fastify: FastifyInstance, prisma: PrismaClient) {
  process.on('SIGINT', async () => {
    fastify.log.info('Shutting down server...')

    await prisma.$disconnect()
    await fastify.close()

    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    fastify.log.info('Shutting down server...')

    await prisma.$disconnect()
    await fastify.close()

    process.exit(0)
  })
}
