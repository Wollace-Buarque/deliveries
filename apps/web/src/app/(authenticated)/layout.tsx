import { ReactNode } from 'react'
import { Header } from '@/components/header'
import { getUserRole } from '@/app/actions/user'

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const userRole = await getUserRole()

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header userRole={userRole} />

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
