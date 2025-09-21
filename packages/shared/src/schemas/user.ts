import { z } from 'zod'

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  avatar: z.url('Invalid avatar URL').optional(),
  document: z.string().min(11, 'Invalid document'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    number: z.string().min(1, 'Number is required'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Neighborhood is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(8, 'Invalid zip code'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    })
  })
})

export const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CLIENT', 'DELIVERY', 'ADMIN']),
  profile: userProfileSchema
})

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export type CreateUserDto = z.infer<typeof createUserSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type UserProfileDto = z.infer<typeof userProfileSchema>
