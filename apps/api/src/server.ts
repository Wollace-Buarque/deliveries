import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { PrismaClient } from '@prisma/client'
import { EventBus } from './events/event-bus'
import { NotificationHandler } from './events/handlers/notification.handler'
import { UserRepository } from './repositories/user.repository'
import { DeliveryRepository } from './repositories/delivery.repository'
import { UserService } from './services/user.service'
import { DeliveryService } from './services/delivery.service'
import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'
import { deliveryRoutes } from './routes/delivery.routes'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

// Database
const prisma = new PrismaClient()

// Event Bus
const eventBus = new EventBus()

// Repositories
const userRepository = new UserRepository(prisma)
const deliveryRepository = new DeliveryRepository(prisma)

// Services
const userService = new UserService(userRepository, eventBus)
const deliveryService = new DeliveryService(deliveryRepository, eventBus)

// Event Handlers
const notificationHandler = new NotificationHandler()
eventBus.register('USER_CREATED', notificationHandler)
eventBus.register('DELIVERY_CREATED', notificationHandler)
eventBus.register('DELIVERY_ACCEPTED', notificationHandler)
eventBus.register('DELIVERY_STATUS_CHANGED', notificationHandler)

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })

  // Security
  await fastify.register(helmet)

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  })

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  })

  // Multipart for file uploads
  await fastify.register(multipart)

  // ...existing code...
}

// Register routes
async function registerRoutes() {
  // Make services available to routes
  fastify.decorate('userService', userService)
  fastify.decorate('deliveryService', deliveryService)
  fastify.decorate('eventBus', eventBus)

  // Register route modules
  await fastify.register(authRoutes, { prefix: '/auth' })
  await fastify.register(userRoutes, { prefix: '/users' })
  await fastify.register(deliveryRoutes, { prefix: '/deliveries' })

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
}

// Error handling
fastify.setErrorHandler(async (error, request, reply) => {
  fastify.log.error(error)

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation error',
      message: error.message,
      details: error.validation
    })
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message
    })
  }

  return reply.status(500).send({
    success: false,
    error: 'Internal server error'
  })
})

// Graceful shutdown
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

// Start server
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()

    const port = parseInt(process.env.PORT || '3001')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
    // ...existing code...
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

// Export for testing
export { fastify, prisma, eventBus }
