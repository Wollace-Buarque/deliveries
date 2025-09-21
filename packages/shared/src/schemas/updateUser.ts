import { z } from 'zod'
import { userProfileSchema } from './user'

export const updateUserSchema = z.object({
  email: z.email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  profile: userProfileSchema.partial().optional()
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>
