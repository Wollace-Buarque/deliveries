import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { LoginDto, RegisterDto, AuthResponseDto } from '../types/dto'
import { createApiResponse } from '@deliveries/shared'

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post<{ Body: RegisterDto }>(
    '/register',
    async (request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply) => {
      try {
        const userService = fastify.userService

        // Check if user already exists
        const existingUser = await userService.findByEmail(request.body.email)
        if (existingUser) {
          return reply.status(400).send(createApiResponse({ success: false, error: 'User already exists' }))
        }

        // Create user
        const user = await userService.create(request.body)

        // Generate tokens
        const accessToken = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: '15m' }
        )

        const refreshToken = fastify.jwt.sign({ userId: user.id, type: 'refresh' }, { expiresIn: '7d' })

        const response: AuthResponseDto = {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: {
              name: user.profile.name,
              phone: user.profile.phone,
              avatar: user.profile.avatar
            }
          },
          accessToken,
          refreshToken
        }

        return reply.status(201).send(createApiResponse({ success: true, data: response, message: 'User created successfully' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Login
  fastify.post<{ Body: LoginDto }>(
    '/login',
    async (request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) => {
      try {
        const userService = fastify.userService
        const { email, password } = request.body

        // Find user
        const user = await userService.findByEmail(email)
        if (!user) {
          return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid credentials' }))
        }

        // Validate password
        const isValidPassword = await userService.validatePassword(password, user.password)
        if (!isValidPassword) {
          return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid credentials' }))
        }

        // Generate tokens
        const accessToken = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: '15m' }
        )

        const refreshToken = fastify.jwt.sign({ userId: user.id, type: 'refresh' }, { expiresIn: '7d' })

        const response: AuthResponseDto = {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: {
              name: user.profile.name,
              phone: user.profile.phone,
              avatar: user.profile.avatar
            }
          },
          accessToken,
          refreshToken
        }

        return reply.send(createApiResponse({ success: true, data: response, message: 'Login successful' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send(createApiResponse({ success: false, error: 'Internal server error' }))
      }
    }
  )

  // Refresh token
  fastify.post(
    '/refresh',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (!token) {
          return reply.status(401).send(createApiResponse({ success: false, error: 'Token required' }))
        }

        const decoded = fastify.jwt.verify(token) as any
        if (decoded.type !== 'refresh') {
          return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid token type' }))
        }

        const userService = fastify.userService
        const user = await userService.findById(decoded.userId)
        if (!user) {
          return reply.status(401).send(createApiResponse({ success: false, error: 'User not found' }))
        }

        const accessToken = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: '15m' }
        )

        return reply.send(createApiResponse({ success: true, data: { accessToken }, message: 'Token refreshed' }))
      } catch (error) {
        fastify.log.error(error)
        return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid token' }))
      }
    }
  )

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    // In a real application, you might want to blacklist the token
    return reply.send(createApiResponse({ success: true, message: 'Logout successful' }))
  })
}
