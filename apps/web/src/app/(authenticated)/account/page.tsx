import { Metadata } from 'next'
import { IconUserCog } from '@tabler/icons-react'

import { Separator } from '@/components/separator'
import { UpdateProfileForm } from '@/components/update-profile-form/update-profile-form'

import { getProfileData } from '@/app/actions/user'

export const metadata: Metadata = {
  title: 'Minha conta'
}

export default async function AccountPage() {
  const profileData = await getProfileData()

  return (
    <main className="container mx-auto p-12">
      <div className="flex items-end gap-4">
        <IconUserCog size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h1 className="text-3xl font-semibold">Configurações</h1>
          <p className="mt-2 text-zinc-600">Gerencie as configurações da sua conta.</p>
        </div>
      </div>

      <Separator />

      {profileData.data && <UpdateProfileForm data={profileData.data} />}
    </main>
  )
}
