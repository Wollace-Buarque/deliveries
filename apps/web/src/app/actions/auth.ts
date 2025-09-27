'use server'

import { AxiosError } from 'axios'

import { cookies } from 'next/headers'
import { api } from '@/lib/axios'

import { SignInSchema } from '@/components/signin-form/signin-form'
import { SignUpSchema } from '@/components/signup-form/signup-form'

async function signUp(data: SignUpSchema, lat?: string, lng?: string) {
  const body = {
    email: data.email,
    password: data.password,
    role: 'CLIENT',
    profile: {
      name: data.name,
      phone: data.phone,
      document: data.document,
      address: {
        zipCode: data.zipCode,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
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
    const { data: responseData } = await api.post('/auth/register', body)

    const cookiesStore = await cookies()
    
    cookiesStore.set('token', responseData.data.accessToken, { secure: true, maxAge: 60 * 60 * 24 * 7 })
    cookiesStore.set('refreshToken', responseData.data.refreshToken, { secure: true, maxAge: 60 * 60 * 24 * 7 })

    return { success: true, message: 'Usuário cadastrado com sucesso!' }
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data.error

      switch (errorMessage) {
        case 'User already exists':
          return { success: false, message: 'E-mail já cadastrado. Utilize outro e-mail.' }
        case 'Document already in use':
          return { success: false, message: 'CPF já cadastrado. Utilize outro CPF.' }
      }
    }

    return { success: false, message: 'Erro ao cadastrar usuário. Tente novamente.' }
  }
}

async function signIn(data: SignInSchema) {
  const body = {
    email: data.email,
    password: data.password
  }

  try {
    const { data: responseData } = await api.post('/auth/login', body)

    const cookiesStore = await cookies()
    cookiesStore.set('token', responseData.data.accessToken, { secure: true, maxAge: 60 * 60 * 24 * 7 })
    cookiesStore.set('refreshToken', responseData.data.refreshToken, { secure: true, maxAge: 60 * 60 * 24 * 7 })

    return { success: true, message: 'Logado com sucesso!' }
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data.error

      switch (errorMessage) {
        case 'Invalid credentials':
          return { success: false, message: 'E-mail ou senha inválidos.' }
      }
    }

    return { success: false, message: 'Erro ao fazer login.' }
  }
}
export { signUp, signIn }
