import { getDeliveries } from '@/app/actions/deliveries'
import { IconAlertHexagon } from '@tabler/icons-react'

import { DeliveryCard } from './delivery-card'
import { ReloadPageButton } from '../reload-page-button'

interface DeliveriesProps {
  params?: { [key: string]: string | string[] | undefined }
}

export async function Deliveries({ params }: DeliveriesProps) {
  const page = params?.page ? Number(params.page) : 1
  const limit = params?.limit ? Number(params.limit) : 10
  const status = params?.status ? String(params.status) : undefined

  const deliveries = await getDeliveries({
    page,
    limit,
    status
  })

  if (!deliveries.success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <IconAlertHexagon className="text-red-500" size={64} stroke={1} />

        <p className="text-lg text-red-500">Algo deu errado ao listar suas entregas. Tente atualizar a página.</p>

        <ReloadPageButton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {deliveries.data.map((delivery) => (
        <DeliveryCard key={delivery.id} delivery={delivery} />
      ))}
    </div>
  )
}
