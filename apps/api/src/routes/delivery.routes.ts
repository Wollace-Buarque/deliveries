import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateDeliveryDto, UpdateDeliveryDto, DeliveryFiltersDto } from '../types/dto'
import { createApiResponse, createPaginatedResponse } from '@deliveries/shared'

// Authentication middleware
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send(createApiResponse({ success: false, error: 'Unauthorized' }))
  }
}

export async function deliveryRoutes(fastify: FastifyInstance) {
  // Get all deliveries
  fastify.get<{ Querystring: DeliveryFiltersDto }>(
    '/',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Querystring: DeliveryFiltersDto }>, reply: FastifyReply) => {
      try {
        const deliveryService = fastify.deliveryService
        const userRole = (request.user as any).role
        const userId = (request.user as any).userId
        const { status, page = 1, limit = 10 } = request.query

        let result
        if (userRole === 'CLIENT') {
          result = await deliveryService.getDeliveriesByClient(userId, page, limit)
        } else if (userRole === 'DELIVERY') {
          result = await deliveryService.getDeliveriesByDeliveryPerson(userId, page, limit)
        } else {
          // Admin can see all deliveries
          result = await deliveryService.getDeliveriesByStatus(status!, page, limit)
        }

        return reply.send(createPaginatedResponse(result.deliveries, page, limit, result.total))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Get available deliveries (for delivery persons)
  fastify.get(
    '/available',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any).role
        if (userRole !== 'DELIVERY') {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }

        const deliveryService = fastify.deliveryService
        const { page = 1, limit = 10 } = request.query as any

        const result = await deliveryService.getAvailableDeliveries(page, limit)
        return reply.send(createPaginatedResponse(result.deliveries, page, limit, result.total))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Create delivery
  fastify.post<{ Body: CreateDeliveryDto }>(
    '/',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Body: CreateDeliveryDto }>, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any).role
        if (userRole !== 'CLIENT') {
          return reply
            .status(403)
            .send(createApiResponse({ success: false, error: 'Only clients can create deliveries' }))
        }

        const deliveryService = fastify.deliveryService
        const userId = (request.user as any).userId

        const delivery = await deliveryService.create({
          ...request.body,
          clientId: userId
        })

        return reply
          .status(201)
          .send(createApiResponse({ success: true, data: delivery, message: 'Delivery created successfully' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Get delivery by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const deliveryService = fastify.deliveryService
        const userId = (request.user as any).userId
        const userRole = (request.user as any).role

        const delivery = await deliveryService.findById(request.params.id)
        if (!delivery) {
          return reply.status(404).send(createApiResponse({ success: false, error: 'Delivery not found' }))
        }

        // Check permissions
        if (userRole === 'CLIENT' && delivery.clientId !== userId) {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }
        if (userRole === 'DELIVERY' && delivery.deliveryId !== userId) {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }

        return reply.send(
          createApiResponse({ success: true, data: delivery, message: 'Delivery retrieved successfully' })
        )
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Accept delivery
  fastify.post<{ Params: { id: string } }>(
    '/:id/accept',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any).role
        if (userRole !== 'DELIVERY') {
          return reply
            .status(403)
            .send(createApiResponse({ success: false, error: 'Only delivery persons can accept deliveries' }))
        }

        const deliveryService = fastify.deliveryService
        const userId = (request.user as any).userId

        const delivery = await deliveryService.acceptDelivery(request.params.id, userId)
        return reply.send(
          createApiResponse({ success: true, data: delivery, message: 'Delivery accepted successfully' })
        )
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Update delivery status
  fastify.put<{
    Params: { id: string }
    Body: { status: string; actualTime?: number }
  }>(
    '/:id/status',
    {
      preHandler: [authenticate]
    },
    async (
      request: FastifyRequest<{
        Params: { id: string }
        Body: { status: string; actualTime?: number }
      }>,
      reply: FastifyReply
    ) => {
      try {
        const deliveryService = fastify.deliveryService
        const userId = (request.user as any).userId
        const userRole = (request.user as any).role

        // Check permissions
        const delivery = await deliveryService.findById(request.params.id)
        if (!delivery) {
          return reply.status(404).send(createApiResponse({ success: false, error: 'Delivery not found' }))
        }

        if (userRole === 'CLIENT' && delivery.clientId !== userId) {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }
        if (userRole === 'DELIVERY' && delivery.deliveryId !== userId) {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }

        const updatedDelivery = await deliveryService.updateStatus(
          request.params.id,
          request.body.status,
          userId,
          request.body.actualTime
        )

        return reply.send(
          createApiResponse({ success: true, data: updatedDelivery, message: 'Delivery status updated successfully' })
        )
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Get delivery statistics (Admin only)
  fastify.get(
    '/stats',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any).role
        if (userRole !== 'ADMIN') {
          return reply.status(401).send(createApiResponse({ success: false, error: 'Unauthorized' }))
        }

        const deliveryService = fastify.deliveryService
        const stats = await deliveryService.getDeliveryStats()

        return reply.send(
          createApiResponse({ success: true, data: stats, message: 'Statistics retrieved successfully' })
        )
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )
}
