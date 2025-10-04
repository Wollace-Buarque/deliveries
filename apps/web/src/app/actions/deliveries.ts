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

export { getDeliveries }
