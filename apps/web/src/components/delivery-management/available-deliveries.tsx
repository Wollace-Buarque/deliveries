import { getAvailableDeliveries } from '@/app/actions/deliveries'
import { IconAlertHexagon, IconMoodEmpty } from '@tabler/icons-react'

import { DeliveryManagementCard } from './delivery-management-card'
import { ReloadPageButton } from '../reload-page-button'
import { Pagination } from '../pagination'

interface AvailableDeliveriesProps {
  params?: { [key: string]: string | string[] | undefined }
}

export async function AvailableDeliveries({ params }: AvailableDeliveriesProps) {
  const page = params?.availablePage ? Number(params.availablePage) : 1
  const limit = 10

  const deliveries = await getAvailableDeliveries({
    page,
    limit
  })

  if (!deliveries.success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <IconAlertHexagon className="text-red-500" size={64} stroke={1} />

        <p className="text-lg text-red-500">Algo deu errado ao listar as entregas disponíveis. Tente atualizar a página.</p>

        <ReloadPageButton />
      </div>
    )
  }

  if (!deliveries.data.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <IconMoodEmpty className="text-zinc-500" size={64} stroke={1} />

        <p className="text-lg text-zinc-500">Não há entregas disponíveis no momento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {deliveries.data.map((delivery) => (
          <DeliveryManagementCard key={delivery.id} delivery={delivery} isAvailable />
        ))}
      </div>

      <div className="mt-4">
        <Pagination pagination={deliveries.pagination} pageParam="availablePage" />
      </div>
    </>
  )
}

