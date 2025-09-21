import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  createApiResponse,
  createPaginatedResponse,
  createDeliverySchema,
  updateDeliveryStatusSchema
} from '@deliveries/shared'
import { z } from 'zod'
import { authenticate } from '@/middleware/authentication.middleware'

export async function deliveryRoutes(fastify: FastifyInstance) {
  // Get all deliveries
  fastify.get(
    '/',
    {
      preHandler: [authenticate]
    },
    async (request, reply) => {
      const deliveryService = fastify.deliveryService
      const userRole = (request.user as any).role
      const userId = (request.user as any).userId

      const querySchema = z.object({
        status: z.string(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10)
      })

      const { status, page, limit } = querySchema.parse(request.query)

      let result
      if (userRole === 'CLIENT') {
        result = await deliveryService.getDeliveriesByClient(userId, page, limit)
      } else if (userRole === 'DELIVERY') {
        result = await deliveryService.getDeliveriesByDeliveryPerson(userId, page, limit)
      } else {
        result = await deliveryService.getDeliveriesByStatus(status, page, limit)
      }

      return reply.send(createPaginatedResponse(result.deliveries, page, limit, result.total))
    }
  )

  // Get available deliveries (for delivery persons)
  fastify.get(
    '/available',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'DELIVERY') {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }

      const querySchema = z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10)
      })

      const { page, limit } = querySchema.parse(request.query)

      const deliveryService = fastify.deliveryService

      const result = await deliveryService.getAvailableDeliveries(page, limit)
      return reply.send(createPaginatedResponse(result.deliveries, page, limit, result.total))
    }
  )

  // Create delivery
  fastify.post(
    '/',
    {
      preHandler: [authenticate]
    },
    async (request, reply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'CLIENT') {
        return reply
          .status(403)
          .send(createApiResponse({ success: false, error: 'Only clients can create deliveries' }))
      }

      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId

      const body = createDeliverySchema.parse(request.body)

      const delivery = await deliveryService.create({
        ...body,
        clientId: userId
      })

      return reply
        .status(201)
        .send(createApiResponse({ success: true, data: delivery, message: 'Delivery created successfully' }))
    }
  )

  // Get delivery by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate]
    },
    async (request, reply) => {
      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId
      const userRole = (request.user as any).role

      const paramsSchema = z.object({
        id: z.cuid('Invalid delivery ID')
      })

      const { id } = paramsSchema.parse(request.params)

      const delivery = await deliveryService.findById(id)
      if (!delivery) {
        return reply.status(404).send(createApiResponse({ success: false, error: 'Delivery not found' }))
      }

      if (userRole === 'CLIENT' && delivery.clientId !== userId) {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }
      if (userRole === 'DELIVERY' && delivery.deliveryId !== userId) {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }

      return reply.send(
        createApiResponse({ success: true, data: delivery, message: 'Delivery retrieved successfully' })
      )
    }
  )

  // Update delivery status
  fastify.put(
    '/:id/status',
    {
      preHandler: [authenticate]
    },
    async (request, reply) => {
      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId
      const userRole = (request.user as any).role

      const paramsSchema = z.object({
        id: z.cuid('Invalid delivery ID')
      })

      const { id } = paramsSchema.parse(request.params)
      const { status, actualTime } = updateDeliveryStatusSchema.parse(request.body)

      const delivery = await deliveryService.findById(id)
      if (!delivery) {
        return reply.status(404).send(createApiResponse({ success: false, error: 'Delivery not found' }))
      }

      if (userRole === 'CLIENT' && delivery.clientId !== userId) {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }
      if (userRole === 'DELIVERY' && delivery.deliveryId !== userId) {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }

      const updatedDelivery = await deliveryService.updateStatus(id, status, userId, actualTime)

      return reply.send(
        createApiResponse({ success: true, data: updatedDelivery, message: 'Delivery status updated successfully' })
      )
    }
  )

  // Get delivery statistics (Admin only)
  fastify.get(
    '/stats',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'ADMIN') {
        return reply.status(401).send(createApiResponse({ success: false, error: 'Unauthorized' }))
      }

      const deliveryService = fastify.deliveryService
      const stats = await deliveryService.getDeliveryStats()

      return reply.send(createApiResponse({ success: true, data: stats, message: 'Statistics retrieved successfully' }))
    }
  )
}
