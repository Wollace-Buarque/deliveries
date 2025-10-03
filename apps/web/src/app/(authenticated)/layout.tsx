import { ReactNode } from 'react'
import { Header } from '@/components/header'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />

      {children}
    </>
  )
}
