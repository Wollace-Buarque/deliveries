import Fastify from 'fastify'

import { PrismaClient } from '@generated/prisma'
import { EventBus } from './events/event-bus'
import { NotificationHandler } from './events/handlers/notification.handler'
import { UserRepository } from './repositories/user.repository'
import { DeliveryRepository } from './repositories/delivery.repository'
import { UserService } from './services/user.service'
import { DeliveryService } from './services/delivery.service'
import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'
import { deliveryRoutes } from './routes/delivery.routes'
import { registerPlugins } from './config/plugins'
import { registerErrorHandler } from './config/error-handler'
import { registerShutdown } from './config/shutdown'
import { env } from './env'

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
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
}

registerErrorHandler(fastify)

async function start() {
  try {
    await registerPlugins(fastify)
    registerShutdown(fastify, prisma)
    await registerRoutes()

    const port = env.PORT

    await fastify.listen({ port })
    console.log(`Server listening on PORT ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

export { fastify, prisma, eventBus }
