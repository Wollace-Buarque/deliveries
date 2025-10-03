import { IconTruckDelivery } from '@tabler/icons-react'
import { ReactNode } from 'react'

export default function UnauthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sky-400 flex items-center justify-center gap-2 py-3 border-b-2 border-b-sky-300">
        <IconTruckDelivery className="text-white" stroke={2}/>

        <span className="text-white font-semibold">Deliveries</span>
      </header>

      <div className="flex flex-col flex-1 items-center justify-center max-w-7xl mx-auto">{children}</div>
    </div>
  )
}
