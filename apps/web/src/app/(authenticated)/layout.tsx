import { ReactNode } from 'react'
import { Header } from '@/components/header'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
