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

const signUpSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'No mínimo 8 caracteres'),
  name: z
    .string()
    .min(2, 'Nome obrigatório')
    .refine((value) => value.trim().split(' ').length >= 2, {
      message: 'Digite seu nome completo'
    }),
  phone: z.string().min(8, 'Celular obrigatório'),
  document: z.string().length(11, 'CPF inválido'),
  zipCode: z.string().length(8, 'CEP inválido'),
  street: z.string().min(5, 'Logradouro obrigatório'),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatório'),
  state: z.string().min(2, 'Estado obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional()
})

export type SignUpSchema = z.infer<typeof signUpSchema>

enum SignUpStep {
  register,
  details
}

export function SignUpForm() {
  const [step, setStep] = useState<SignUpStep>(SignUpStep.register)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    trigger,
    setValue
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched'
  })

  async function handleNextStep() {
    const isEmailAndPasswordValid = await trigger(['email', 'password'])
    if (!isEmailAndPasswordValid) return

    setStep(SignUpStep.details)
  }

  function handleBackStep() {
    setStep(SignUpStep.register)
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
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
      <h1 className="text-3xl font-bold">{step === SignUpStep.register ? 'Crie sua conta' : 'Quase lá!'}</h1>

      {step === SignUpStep.register && (
        <p className="mt-1 text-sm text-zinc-700">Informe seu e-mail e defina uma senha forte.</p>
      )}

      {step === SignUpStep.details && (
        <p className="mt-1 text-sm text-zinc-700">
          Por favor, preencha os dados restantes para completar seu cadastro.
        </p>
      )}

      <form onSubmit={handleSubmit(handleSignUp)} className="mt-4">
        <div className="flex w-96 flex-col gap-3">
          {step === SignUpStep.register && (
            <FirstStep
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              handleNextStep={handleNextStep}
            />
          )}

          {step === SignUpStep.details && (
            <SecondStep
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              handleBackStep={handleBackStep}
              setValue={setValue}
            />
          )}
        </div>
      </form>

      {step === SignUpStep.register && (
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
