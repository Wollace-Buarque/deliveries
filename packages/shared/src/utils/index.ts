import { z } from 'zod'

// Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CLIENT', 'DELIVERY', 'ADMIN']),
  profile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Invalid phone number'),
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
})

export const createDeliverySchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  origin: z.object({
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
  }),
  destination: z.object({
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
  }),
  description: z.string().min(1, 'Description is required'),
  value: z.number().min(0, 'Value must be positive')
})

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
  actualTime: z.number().optional()
})

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const calculateEstimatedTime = (distance: number): number => {
  // Assuming average speed of 30 km/h in urban areas
  const averageSpeed = 30
  return Math.ceil((distance / averageSpeed) * 60) // in minutes
}

export const validateDocument = (document: string): boolean => {
  // Brazilian CPF validation
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  return cpfRegex.test(document)
}

export const createApiResponse = <T>({
  success,
  data,
  error,
  message
}: {
  success: boolean
  data?: T
  error?: string
  message?: string
}) => {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(message && { message })
  }
}

export const createPaginatedResponse = <T>(data: T[], page: number, limit: number, total: number) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
