import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  createApiResponse,
  createPaginatedResponse,
  createDeliverySchema,
  updateDeliveryStatusSchema,
  calculateDistancesGPU
} from '@deliveries/shared'
import { z } from 'zod'
import { authenticate } from '@/middleware/authentication.middleware'
import { DeliveryStatus } from '@generated/prisma'

export async function deliveryRoutes(fastify: FastifyInstance) {
  // Matriz de distâncias entre entregas disponíveis (para entregadores)
  fastify.get(
    '/available/distances',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'DELIVERY') {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }

      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId

      const { deliveries } = await deliveryService.getDeliveriesByDeliveryPerson(userId,1, 100)

      const addressesRaw = deliveries?.map(d => ({
        id: d.id,
        street: d.origin.street,
        number: d.origin.number,
        neighborhood: d.origin.neighborhood,
        city: d.origin.city,
        state: d.origin.state,
        zipCode: d.origin.zipCode,
        coordinates: d.origin.coordinates
      })) || []

      const seen = new Set<string>()
      const addresses = addressesRaw.filter(addr => {
        const key = `${addr.street}|${addr.number}|${addr.city}|${addr.state}|${addr.zipCode}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      if (!addresses || addresses.length < 2) {
        return reply.send(createApiResponse({ success: true, data: { addresses, distances: [] }, message: 'Poucas entregas disponíveis para cálculo.' }))
      }

      const distances = calculateDistancesGPU(addresses)
      return reply.send(createApiResponse({ success: true, data: { addresses, distances }, message: 'Matriz de distâncias calculada com sucesso.' }))
    }
  )
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
        status: z.string().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10)
      })

      const { status, page, limit } = querySchema.parse(request.query)
      const deliveryStatus = status ? status as DeliveryStatus : undefined
      
      let result
      if (userRole === 'CLIENT') {
        result = await deliveryService.getDeliveriesByClient(userId, page, limit, deliveryStatus)
      } else if (userRole === 'DELIVERY') {
        result = await deliveryService.getDeliveriesByDeliveryPerson(userId, page, limit, deliveryStatus)
      } else {
        result = await deliveryService.getDeliveriesByStatus(deliveryStatus!, page, limit)
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

      const { deliveries, total } = await deliveryService.getAvailableDeliveries(page, limit)

      return reply.send(createPaginatedResponse(deliveries, page, limit, total))
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

      const deliverySchema = createDeliverySchema.extend({
        clientId: z.cuid().optional()
      })

      const body = deliverySchema.parse(request.body)

      const delivery = await deliveryService.create({
        ...body,
        clientId: userId
      })

      return reply
        .status(201)
        .send(createApiResponse({ success: true, data: delivery, message: 'Delivery created successfully' }))
    }
  )

  // Accept delivery (for delivery persons)
  fastify.post(
    '/:id/accept',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'DELIVERY') {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Only delivery persons can accept deliveries' }))
      }

      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId

      const paramsSchema = z.object({
        id: z.cuid('Invalid delivery ID')
      })

      const { id } = paramsSchema.parse(request.params)

      const delivery = await deliveryService.findById(id)
      if (!delivery) {
        return reply.status(404).send(createApiResponse({ success: false, error: 'Delivery not found' }))
      }

      if (delivery.status !== 'PENDING') {
        return reply.status(400).send(createApiResponse({ success: false, error: 'Delivery is not available' }))
      }

      if (delivery.deliveryId) {
        return reply.status(400).send(createApiResponse({ success: false, error: 'Delivery already accepted' }))
      }

      const acceptedDelivery = await deliveryService.acceptDelivery(id, userId)

      return reply.send(
        createApiResponse({ success: true, data: acceptedDelivery, message: 'Delivery accepted successfully' })
      )
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

  // Get delivery person statistics
  fastify.get(
    '/my-stats',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role
      if (userRole !== 'DELIVERY') {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Only delivery persons can access their stats' }))
      }

      const deliveryService = fastify.deliveryService
      const userId = (request.user as any).userId

      const stats = await deliveryService.getDeliveryPersonStats(userId)

      return reply.send(createApiResponse({ success: true, data: stats, message: 'Statistics retrieved successfully' }))
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
