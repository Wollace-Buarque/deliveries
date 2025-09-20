import { z } from 'zod'

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const calculateEstimatedTime = (distance: number): number => {
  // Assuming average speed of 30 km/h in urban areas
  const averageSpeed = 30
  return Math.ceil((distance / averageSpeed) * 60) // in minutes
}

const validateDocument = (document: string): boolean => {
  // Brazilian CPF validation
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  return cpfRegex.test(document)
}

const createApiResponse = <T>({
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

const createPaginatedResponse = <T>(data: T[], page: number, limit: number, total: number) => {
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

export {
  formatCurrency,
  formatDate,
  calculateDistance,
  calculateEstimatedTime,
  validateDocument,
  createApiResponse,
  createPaginatedResponse
};
