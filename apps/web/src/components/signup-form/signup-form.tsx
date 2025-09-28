'use client'

import z from 'zod'
import Link from 'next/link'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FirstStep } from './first-step'
import { SecondStep } from './second-step'
import { toast } from 'sonner'
import { signUp } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

import { isValidCPF, isPhoneNumberValid, isValidZipCode } from '@/lib/validators'

const signUpSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'No mínimo 8 caracteres'),
  name: z.string().refine((value) => value.trim().split(' ').length >= 2, {
    message: 'Digite seu nome completo'
  }),
  phone: z
    .string()
    .min(9, 'O celular deve ter no mínimo 9 dígitos')
    .refine((value) => isPhoneNumberValid(value), { message: 'Celular inválido' }),
  document: z
    .string()
    .min(11, 'O CPF deve ter no mínimo 11 dígitos')
    .max(14, 'O CPF deve ter no máximo 14 dígitos')
    .refine((value) => isValidCPF(value), { message: 'CPF inválido' }),
  zipCode: z
    .string()
    .min(8, 'O CEP deve ter no mínimo 8 dígitos')
    .refine((value) => isValidZipCode(value), { message: 'CEP inválido' }),
  street: z.string({ error: 'A rua é obrigatória' }),
  neighborhood: z.string({ error: 'O bairro é obrigatório' }),
  city: z.string({ error: 'A cidade é obrigatória' }),
  state: z.string().length(2, 'Estado incorreto'),
  number: z.string({ error: 'O número é obrigatório' }),
  complement: z.string().optional()
})

export type SignUpSchema = z.infer<typeof signUpSchema>

enum SignUpStep {
  REGISTER,
  DETAILS
}

export function SignUpForm() {
  const [step, setStep] = useState<SignUpStep>(SignUpStep.REGISTER)

  const {
    clearErrors,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    trigger,
    setValue
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched'
  })

  async function handleNextStep() {
    const isEmailAndPasswordValid = await trigger(['email', 'password'])
    if (!isEmailAndPasswordValid) return

    setStep(SignUpStep.DETAILS)
  }

  function handleBackStep() {
    setStep(SignUpStep.REGISTER)
  }

  async function handleAddressLookup(params: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }) {
    const fullAddress = `${params.street}, ${params.number || ''}, ${params.neighborhood}, ${params.city}, ${params.state}, ${params.zipCode}, Brasil`

    let lat = null
    let lng = null

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`,
        {
          next: {
            revalidate: 60 * 30
          }
        }
      )
      const geoResponseData = await geoResponse.json()
      if (geoResponseData && geoResponseData.length > 0) {
        lat = geoResponseData[0].lat
        lng = geoResponseData[0].lon
      }
    } catch {
      toast.error('Erro ao obter coordenadas do endereço. Verifique o endereço e tente novamente.')
    }

    return { lat, lng }
  }

  async function handleSignUp(data: SignUpSchema) {
    const { lat, lng } = await handleAddressLookup({
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode
    })

    const response = await signUp(data, lat, lng)
    if (!response.success) return toast.error(response.message)

    toast.success(response.message)

    redirect('/')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{step === SignUpStep.REGISTER ? 'Crie sua conta' : 'Quase lá!'}</h1>

      <p className="mt-1 text-sm text-zinc-700">
        {step === SignUpStep.REGISTER && 'Informe seu e-mail e defina uma senha forte.'}
        {step === SignUpStep.DETAILS && 'Por favor, preencha os dados restantes para completar seu cadastro.'}
      </p>

      <form onSubmit={handleSubmit(handleSignUp)} className="mt-4">
        <div className="flex w-96 flex-col gap-3">
          {step === SignUpStep.REGISTER && (
            <FirstStep
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              handleNextStep={handleNextStep}
            />
          )}

          {step === SignUpStep.DETAILS && (
            <SecondStep
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              handleBackStep={handleBackStep}
              setValue={setValue}
              clearErrors={clearErrors}
            />
          )}
        </div>
      </form>

      {step === SignUpStep.REGISTER && (
        <div className="mt-4 text-sm text-zinc-700">
          <span>Já tem uma conta?</span>{' '}
          <Link href="/login" className="text-sky-700 hover:underline">
            Entre agora
          </Link>
        </div>
      )}
    </div>
  )
}
