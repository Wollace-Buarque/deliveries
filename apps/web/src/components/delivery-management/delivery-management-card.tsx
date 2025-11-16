'use client'

import { useState } from 'react'

import { toast } from 'sonner'
import { IconMap2 } from '@tabler/icons-react'

import { Delivery } from '@/app/actions/deliveries'
import { useAcceptDelivery, useUpdateDeliveryStatus } from '@/hooks/use-deliveries'
import { cn, formatMinutesToDuration } from '@/lib/utils'
import { Button } from '@/components/button'
import { DeliveryMapModal } from './delivery-map-modal'

import * as Dialog from '@radix-ui/react-dialog'

const statusObject = {
  PENDING: {
    translation: 'Pendente',
    className: 'bg-orange-50 text-orange-700',
    nextStatus: 'ACCEPTED',
    nextStatusLabel: 'Aceitar Entrega'
  },
  ACCEPTED: {
    translation: 'Aceito',
    className: 'bg-green-50 text-green-700',
    nextStatus: 'PICKED_UP',
    nextStatusLabel: 'Marcar como Coletado'
  },
  PICKED_UP: {
    translation: 'Coletado',
    className: 'bg-blue-50 text-blue-700',
    nextStatus: 'IN_TRANSIT',
    nextStatusLabel: 'Iniciar Transporte'
  },
  IN_TRANSIT: {
    translation: 'Em Trânsito',
    className: 'bg-violet-50 text-violet-700',
    nextStatus: 'DELIVERED',
    nextStatusLabel: 'Marcar como Entregue'
  },
  DELIVERED: {
    translation: 'Entregue',
    className: 'bg-emerald-50 text-emerald-700',
    nextStatus: null,
    nextStatusLabel: null
  },
  CANCELLED: {
    translation: 'Cancelado',
    className: 'bg-red-50 text-red-700',
    nextStatus: null,
    nextStatusLabel: null
  }
} as const

type StatusKey = keyof typeof statusObject

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface DeliveryManagementCardProps {
  delivery: Delivery
  isAvailable?: boolean
}

export function DeliveryManagementCard({ delivery, isAvailable = false }: DeliveryManagementCardProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const status = delivery.status as StatusKey
  const parsedStatus = statusObject[status]

  const acceptMutation = useAcceptDelivery()
  const updateStatusMutation = useUpdateDeliveryStatus()

  const isLoading = acceptMutation.isPending || updateStatusMutation.isPending

  async function handleAcceptDelivery() {
    acceptMutation.mutate(delivery.id, {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(response.message)
          return
        }

        toast.success('Entrega aceita com sucesso!')
      },
      onError: () => {
        toast.error('Erro ao aceitar entrega')
      }
    })
  }

  async function handleStatusUpdate(newStatus: StatusKey) {
    updateStatusMutation.mutate(
      {
        deliveryId: delivery.id,
        status: newStatus
      },
      {
        onSuccess: (response) => {
          if (!response.success) {
            toast.error(response.message)
            return
          }
          toast.success('Status atualizado com sucesso!')
        },
        onError: () => {
          toast.error('Erro ao atualizar status')
        }
      }
    )
  }

  const canUpdateStatus = parsedStatus.nextStatus !== null && !isAvailable
  const isCompleted = status === 'DELIVERED' || status === 'CANCELLED'

  return (
    <article className="rounded-lg bg-zinc-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span
                className={cn(`rounded-full px-3 py-1 text-xs font-semibold`, {
                  [parsedStatus.className]: true
                })}
              >
                {parsedStatus.translation.toUpperCase()}
              </span>

              <h3 className="line-clamp-1 text-lg font-semibold">
                {delivery.description ?? `Entrega #${delivery.id.slice(0, 8)}`}
              </h3>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <div>
                <strong className="text-gray-800">Cliente:</strong> {delivery.client.profile.name} —{' '}
                {delivery.client.email}
              </div>

              <div className="mt-2">
                <strong className="text-gray-800">Origem:</strong> {delivery.origin.street}, {delivery.origin.number} —{' '}
                {delivery.origin.neighborhood}, {delivery.origin.city} - {delivery.origin.state}
              </div>

              <div className="mt-1">
                <strong className="text-gray-800">Destino:</strong> {delivery.destination.street},{' '}
                {delivery.destination.number} — {delivery.destination.neighborhood}, {delivery.destination.city} -{' '}
                {delivery.destination.state}
              </div>
            </div>
          </div>

          <div className="min-w-36 text-right">
            <div className="text-lg font-bold">{formatCurrency(delivery.value)}</div>
            <div className="mt-2 text-sm text-gray-600">
              Possível estimativa: {formatMinutesToDuration(delivery.estimatedTime)}
            </div>

            {delivery.actualTime && status === 'DELIVERED' && (
              <div className="mt-1 text-sm font-semibold text-green-700">
                Real: {formatMinutesToDuration(delivery.actualTime)}
              </div>
            )}
          </div>
        </div>

        <div>
          <Dialog.Root open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
            <Dialog.Trigger asChild>
              <Button className="bg-sky-600 text-white hover:bg-sky-700">
                <IconMap2 size={16} />
                Trajeto
              </Button>
            </Dialog.Trigger>

            <DeliveryMapModal
              origin={{
                lat: delivery.origin.coordinates.lat,
                lng: delivery.origin.coordinates.lng
              }}
              destination={{
                lat: delivery.destination.coordinates.lat,
                lng: delivery.destination.coordinates.lng
              }}
              open={isMapModalOpen}
            />
          </Dialog.Root>
        </div>

        {!isCompleted && (
          <div className="flex gap-2 border-t border-gray-200 pt-3">
            {canUpdateStatus && parsedStatus.nextStatusLabel && (
              <Button
                onClick={() => handleStatusUpdate(parsedStatus.nextStatus!)}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLoading ? 'Atualizando...' : parsedStatus.nextStatusLabel}
              </Button>
            )}

            {isAvailable && (
              <Button
                onClick={handleAcceptDelivery}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                {isLoading ? 'Aceitando...' : 'Aceitar Entrega'}
              </Button>
            )}

            {!isAvailable && (
              <Button
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isLoading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
