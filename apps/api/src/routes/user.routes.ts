import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { updateUserSchema } from '@deliveries/shared'

import { createApiResponse, createPaginatedResponse } from '@deliveries/shared'
import { authenticate } from '@/middleware/authentication.middleware'
import { safeRetrieveDomain } from '@/utils'
import z from 'zod'

export async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get(
    '/profile',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userService = fastify.userService
      const userId = (request.user as any).userId

      const user = await userService.findById(userId)
      if (!user) {
        return reply.status(404).send(createApiResponse({ success: false, error: 'User not found' }))
      }

      return reply.send(createApiResponse({ success: true, data: safeRetrieveDomain(user), message: 'Profile retrieved successfully' }))
    }
  )

  // Update user profile
  fastify.put(
    '/profile',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userService = fastify.userService
      const userId = (request.user as any).userId

      const body = updateUserSchema.parse(request.body)
      const user = await userService.update(userId, body)

      return reply.send(createApiResponse({ success: true, data: safeRetrieveDomain(user), message: 'Profile updated successfully' }))
    }
  )

  // Upload avatar
  fastify.post(
    '/upload-avatar',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send(createApiResponse({ success: false, error: 'No file uploaded' }))
      }

      // TODO: Implement file upload logic (AWS S3, Cloudinary, etc.)
      const avatarUrl = `https://example.com/avatars/${data.filename}`
      const userService = fastify.userService
      const userId = (request.user as any).userId
      const user = await userService.uploadAvatar(userId, avatarUrl)

      return reply.send(createApiResponse({ success: true, data: safeRetrieveDomain(user), message: 'Avatar uploaded successfully' }))
    }
  )

  // Get users by role (Admin only)
  fastify.get(
    '/by-role',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userRole = (request.user as any).role

      if (userRole !== 'ADMIN') {
        return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
      }

      const userService = fastify.userService

      const querySchema = z.object({
        role: z.string(),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10)
      })

      const { role, page, limit } = querySchema.parse(request.query)
      const { users, total } = await userService.getUsersByRole(role, page, limit)
      let safeUsers = users.map(user => safeRetrieveDomain(user))

      return reply.send(createPaginatedResponse(safeUsers, page, limit, total))
    }
  )
}
