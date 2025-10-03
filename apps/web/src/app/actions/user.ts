'use server'

import { cookies } from 'next/headers'
import { api } from '@/lib/axios'

import { UpdateProfileData } from '@/components/update-profile-form/update-profile-form'

type ProfileResponse = {
  success: boolean
  message: string
  data?: {
    email: string
    profile: {
      name: string
      phone: string
      address: {
        zipCode: string
        state: string
        city: string
        neighborhood: string
        street: string
        number: string
        complement?: string
      }
    }
  }
}

export type UserProfile = {
  email: string
  profile: {
    name: string
    phone: string
    address: {
      zipCode: string
      state: string
      city: string
      neighborhood: string
      street: string
      number: string
      complement?: string
    }
  }
}

async function getProfileData(): Promise<ProfileResponse> {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  if (!token) {
    return { success: false, message: 'Ocorreu um erro ao obter seu perfil, por favor faça login novamente.' }
  }

  try {
    const { data, status } = await api.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (status === 200) {
      return data
    }

    return { success: false, message: 'Erro ao obter dados do perfil' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erro ao obter dados do perfil' }
  }
}

async function updateProfile(data: UpdateProfileData, lat: string, lng: string) {
  const body = {
    profile: {
      name: data.name,
      phone: data.phone,
      address: {
        zipCode: data.zipCode,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street,
        number: data.number,
        complement: data.complement,
        coordinates: {
          lat: Number(lat),
          lng: Number(lng)
        }
      }
    }
  }

  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('token')?.value

    if (!token) {
      return { success: false, message: 'Ocorreu um erro ao atualizar o seu perfil, por favor faça login novamente.' }
    }

    const { status } = await api.put('/users/profile', body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (status === 200) return { success: true, message: 'Perfil atualizado com sucesso!' }

    return { success: false, message: 'Erro ao atualizar perfil. Confira seus dados e tente novamente.' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erro ao atualizar perfil. Tente novamente.' }
  }
}

export { getProfileData, updateProfile }
