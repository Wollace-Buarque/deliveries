'use server'

import { api } from '@/lib/axios'
import { cookies } from 'next/headers'

type Coordinates = { lat: number; lng: number }

type Address = {
  id: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  coordinates: Coordinates
}

type ClientProfile = { name: string; phone?: string }

type Client = { id: string; email: string; profile: ClientProfile }

export type Delivery = {
  id: string
  clientId: string
  deliveryId: string | null
  status: string
  description?: string | null
  value: number
  estimatedTime: number
  actualTime?: number | null
  createdAt: string
  updatedAt: string
  originId: string
  destinationId: string
  client: Client
  deliveryPerson?: any | null
  origin: Address
  destination: Address
}

export type ApiPagination = { page: number; limit: number; total: number; totalPages: number }

type GetDeliveriesResponse = {
  success: boolean
  data: Delivery[]
  pagination: ApiPagination
}

async function getDeliveries({
  page = 1,
  limit = 10,
  status
}: {
  page?: number
  limit?: number
  status?: string
}): Promise<GetDeliveriesResponse> {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  const params = {
    page,
    limit,
    status
  }

  const { data } = await api.get('/deliveries', {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return {
    success: data.success,
    data: data.data,
    pagination: data.pagination
  }
}

type CreateDeliveryRequest = {
  origin: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    coordinates: { lat: number; lng: number }
  }
  destination: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    coordinates: { lat: number; lng: number }
  }
  description: string
  value: number
}

type CreateDeliveryResponse = {
  success: boolean
  message: string
  data?: any
}

async function createDelivery(data: CreateDeliveryRequest): Promise<CreateDeliveryResponse> {
  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('token')?.value

    if (!token) {
      return {
        success: false,
        message: 'Ocorreu um erro ao criar a entrega. Por favor, tente realizar o login novamente.'
      }
    }

    const { data: response } = await api.post('/deliveries', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      success: response.success,
      message: response.message,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

type GetAvailableDeliveriesResponse = {
  success: boolean
  data: Delivery[]
  pagination: ApiPagination
}

async function getAvailableDeliveries({
  page = 1,
  limit = 10
}: {
  page?: number
  limit?: number
}): Promise<GetAvailableDeliveriesResponse> {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  const params = {
    page,
    limit
  }

  const { data } = await api.get('/deliveries/available', {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return {
    success: data.success,
    data: data.data,
    pagination: data.pagination
  }
}

type UpdateDeliveryStatusResponse = {
  success: boolean
  message: string
  data?: any
}

async function updateDeliveryStatus(
  deliveryId: string,
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED',
  actualTime?: number
): Promise<UpdateDeliveryStatusResponse> {
  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('token')?.value

    if (!token) {
      return {
        success: false,
        message: 'Ocorreu um erro ao atualizar o status. Por favor, tente realizar o login novamente.'
      }
    }

    const { data: response } = await api.put(
      `/deliveries/${deliveryId}/status`,
      { status, actualTime },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return {
      success: response.success,
      message: response.message,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

type AcceptDeliveryResponse = {
  success: boolean
  message: string
  data?: any
}

async function acceptDelivery(deliveryId: string): Promise<AcceptDeliveryResponse> {
  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('token')?.value

    if (!token) {
      return {
        success: false,
        message: 'Ocorreu um erro ao aceitar a entrega. Por favor, tente realizar o login novamente.'
      }
    }

    const { data: response } = await api.post(
      `/deliveries/${deliveryId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return {
      success: response.success,
      message: response.message,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export type DeliveryPersonStats = {
  overview: {
    totalDeliveries: number
    completedDeliveries: number
    cancelledDeliveries: number
    activeDeliveries: number
    successRate: number
  }
  earnings: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    lastMonth: number
    projectedMonthly: number
  }
  performance: {
    averageDeliveryTime: number
    onTimeRate: number
    totalOnTime: number
    totalDelivered: number
  }
  trends: {
    deliveriesThisWeek: number
    deliveriesLastWeek: number
    weeklyGrowth: number
    deliveriesThisMonth: number
    deliveriesLastMonth: number
    monthlyGrowth: number
  }
}

type GetStatsResponse = {
  success: boolean
  data?: DeliveryPersonStats
  message?: string
}

async function getMyStats(): Promise<GetStatsResponse> {
  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('token')?.value

    if (!token) {
      return {
        success: false,
        message: 'Ocorreu um erro ao obter estatísticas. Por favor, tente realizar o login novamente.'
      }
    }

    const { data: response } = await api.get('/deliveries/my-stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      success: response.success,
      data: response.data,
      message: response.message
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export { getDeliveries, createDelivery, getAvailableDeliveries, updateDeliveryStatus, acceptDelivery, getMyStats }
