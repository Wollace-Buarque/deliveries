import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UpdateUserDto, UserFiltersDto } from '../types/dto'
import { createApiResponse, createPaginatedResponse } from '@deliveries/shared'

// Authentication middleware
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send(createApiResponse({ success: false, error: 'Unauthorized' }))
  }
}

export async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get(
    '/profile',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userService = fastify.userService
        const userId = (request.user as any).userId

        const user = await userService.findById(userId)
        if (!user) {
          return reply.status(404).send(createApiResponse({ success: false, error: 'User not found' }))
        }

        return reply.send(createApiResponse({ success: true, data: user, message: 'Profile retrieved successfully' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Update user profile
  fastify.put<{ Body: UpdateUserDto }>(
    '/profile',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Body: UpdateUserDto }>, reply: FastifyReply) => {
      try {
        const userService = fastify.userService
        const userId = (request.user as any).userId

        const user = await userService.update(userId, request.body)
        return reply.send(createApiResponse({ success: true, data: user, message: 'Profile updated successfully' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Upload avatar
  fastify.post(
    '/upload-avatar',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await request.file()
        if (!data) {
          return reply.status(400).send(createApiResponse({ success: false, error: 'No file uploaded' }))
        }

        // TODO: Implement file upload logic (AWS S3, Cloudinary, etc.)
        const avatarUrl = `https://example.com/avatars/${data.filename}`

        const userService = fastify.userService
        const userId = (request.user as any).userId

        const user = await userService.uploadAvatar(userId, avatarUrl)
        return reply.send(createApiResponse({ success: true, data: user, message: 'Avatar uploaded successfully' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Get users by role (Admin only)
  fastify.get<{ Querystring: UserFiltersDto }>(
    '/by-role',
    {
      preHandler: [authenticate]
    },
    async (request: FastifyRequest<{ Querystring: UserFiltersDto }>, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any).role
        if (userRole !== 'ADMIN') {
          return reply.status(403).send(createApiResponse({ success: false, error: 'Forbidden' }))
        }

        const userService = fastify.userService
        const { role, page = 1, limit = 10 } = request.query

        const { users, total } = await userService.getUsersByRole(role!, page, limit)

        return reply.send(createPaginatedResponse(users, page, limit, total))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )
}
