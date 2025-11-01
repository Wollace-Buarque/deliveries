'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getDeliveries, 
  getAvailableDeliveries, 
  acceptDelivery, 
  updateDeliveryStatus,
  getMyStats,
} from '@/app/actions/deliveries'

export const deliveryKeys = {
  all: ['deliveries'],
  myDeliveries: (page: number) => [...deliveryKeys.all, 'my', page],
  available: (page: number) => [...deliveryKeys.all, 'available', page],
  stats: () => [...deliveryKeys.all, 'stats']
}

// Hook: Minhas Entregas
export function useMyDeliveries(page: number = 1, enabled: boolean = true) {
  return useQuery({
    queryKey: deliveryKeys.myDeliveries(page),
    queryFn: () => getDeliveries({ page, limit: 10 }),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000
  })
}

// Hook: Entregas Disponíveis (com polling)
export function useAvailableDeliveries(page: number = 1, enabled: boolean = true) {
  return useQuery({
    queryKey: deliveryKeys.available(page),
    queryFn: () => getAvailableDeliveries({ page, limit: 10 }),
    enabled,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000
  })
}

// Hook: Estatísticas
export function useDeliveryStats(enabled: boolean = true) {
  return useQuery({
    queryKey: deliveryKeys.stats(),
    queryFn: () => getMyStats(),
    enabled,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  })
}

// Mutation: Aceitar Entrega
export function useAcceptDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deliveryId: string) => acceptDelivery(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    }
  })
}

// Mutation: Atualizar Status
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      deliveryId, 
      status, 
      actualTime 
    }: { 
      deliveryId: string
      status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
      actualTime?: number 
    }) => updateDeliveryStatus(deliveryId, status, actualTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    }
  })
}

