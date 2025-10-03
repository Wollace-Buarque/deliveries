import { Metadata } from 'next'
import { Suspense } from 'react'
import { IconBox } from '@tabler/icons-react'

import { Separator } from '@/components/separator'
import { Deliveries } from '@/components/deliveries/deliveries'
import { DeliveriesSkeleton } from '@/components/deliveries/deliveries-skeleton'

export const metadata: Metadata = {
  title: 'Sistema de Entregas',
  description: 'Sistema completo de gerenciamento de entregas'
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <main className="container mx-auto flex flex-1 flex-col p-12">
      <div className="flex items-end gap-4">
        <IconBox size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h1 className="text-3xl font-semibold">Lista de Entregas</h1>
          <p className="mt-2 text-zinc-600">Visualize e gerencie as suas entregas</p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col">
        <Suspense fallback={<DeliveriesSkeleton />}>
          <Deliveries params={params} />
        </Suspense>
      </div>
    </main>
  )
}
