import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createApiResponse } from '@deliveries/shared'
import { createUserSchema, loginSchema, CreateUserDto, LoginDto } from '@deliveries/shared'

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const userService = fastify.userService
    const parsedBody: CreateUserDto = createUserSchema.parse(request.body)

    const existingUser = await userService.findByEmail(parsedBody.email)
    if (existingUser) {
      return reply.status(400).send(createApiResponse({ success: false, error: 'User already exists' }))
    }

    const user = await userService.create(parsedBody)

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })

    const refreshToken = fastify.jwt.sign({ userId: user.id, type: 'refresh' }, { expiresIn: '7d' })

    const response = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          name: user.profile!.name,
          phone: user.profile!.phone,
          avatar: user.profile!.avatar || undefined
        }
      },
      accessToken,
      refreshToken
    }

    return reply
      .status(201)
      .send(createApiResponse({ success: true, data: response, message: 'User created successfully' }))
  })

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const userService = fastify.userService
    const parsedBody: LoginDto = loginSchema.parse(request.body)
    const { email, password } = parsedBody

    const user = await userService.findByEmail(email)
    if (!user) {
      return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid credentials' }))
    }

    const isValidPassword = await userService.validatePassword(password, user.password)
    if (!isValidPassword) {
      return reply.status(401).send(createApiResponse({ success: false, error: 'Invalid credentials' }))
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })

    const refreshToken = fastify.jwt.sign({ userId: user.id, type: 'refresh' }, { expiresIn: '7d' })

    const response = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          name: user.profile!.name,
          phone: user.profile!.phone,
          avatar: user.profile!.avatar || undefined
        }
      },
      accessToken,
      refreshToken
    }

    return reply.send(createApiResponse({ success: true, data: response, message: 'Login successful' }))
  })

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })

    return reply.send(createApiResponse({ success: true, data: { accessToken }, message: 'Token refreshed' }))
  })

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send(createApiResponse({ success: true, message: 'Logout successful' }))
  })
}
