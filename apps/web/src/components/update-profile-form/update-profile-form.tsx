'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/button'
import { Input } from '@/components/forms/input'
import { Label } from '@/components/forms/label'

import { fetchAddressByZipCode, handleAddressLookup } from '@/lib/utils'
import { isPhoneNumberValid, isValidZipCode } from '@/lib/validators'
import { updateProfile, UserProfile } from '@/app/actions/user'
import { InputError } from '../forms/input-error'
import { FocusEvent, useState } from 'react'

const updateProfileSchema = z.object({
  name: z.string().refine((value) => value.trim().split(' ').length >= 2, {
    message: 'Digite seu nome completo'
  }),
  phone: z
    .string()
    .min(9, 'O celular deve ter no mínimo 9 dígitos')
    .refine((value) => isPhoneNumberValid(value), { message: 'Celular inválido' }),
  zipCode: z
    .string()
    .min(8, 'O CEP deve ter no mínimo 8 dígitos')
    .refine((value) => isValidZipCode(value), { message: 'CEP inválido' }),
  street: z.string().min(1, 'A rua é obrigatória'),
  neighborhood: z.string().min(1, 'O bairro é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  state: z.string().length(2, 'Estado incorreto'),
  number: z.string().min(1, 'O número é obrigatório'),
  complement: z.string().optional()
})

export type UpdateProfileData = z.infer<typeof updateProfileSchema>

interface UpdateProfileFormProps {
  data: UserProfile
}

export function UpdateProfileForm({ data }: UpdateProfileFormProps) {
  const [isFetching, setIsFetching] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { isSubmitting, errors }
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: data.profile.name,
      phone: data.profile.phone,
      zipCode: data.profile.address.zipCode,
      street: data.profile.address.street,
      neighborhood: data.profile.address.neighborhood,
      city: data.profile.address.city,
      state: data.profile.address.state,
      number: data.profile.address.number,
      complement: data.profile.address.complement || ''
    },
    mode: 'onTouched'
  })

  async function handleUpdateProfile(data: UpdateProfileData) {
    const { lat, lng } = await handleAddressLookup({
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode
    })

    if (!lat || !lng) {
      return toast.error('Erro ao obter coordenadas do endereço. Verifique o endereço e tente novamente.')
    }

    const response = await updateProfile(data, lat, lng)
    if (response.success) return toast.success(response.message)

    toast.error(response.message)
  }

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const cep = event.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsFetching(true)

    const addressData = await fetchAddressByZipCode(cep)

    if (setValue && addressData) {
      setValue('street', addressData.street)
      setValue('neighborhood', addressData.neighborhood)
      setValue('city', addressData.city)
      setValue('state', addressData.state)
      clearErrors(['street', 'neighborhood', 'city', 'state'])
    }

    setIsFetching(false)
  }

  return (
    <form onSubmit={handleSubmit(handleUpdateProfile)} className="grid gap-4">
      <h2 className="text-xl font-semibold">Perfil</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Seu nome" {...register('name')} />
          <InputError field={errors.name} />
        </div>

        <div>
          <Label htmlFor="phone">Numero de celular</Label>
          <Input id="phone" placeholder="Seu celular" {...register('phone')} />
          <InputError field={errors.phone} />
        </div>
      </div>

      <div className="mt-2 grid gap-4">
        <h2 className="text-xl font-semibold">Endereço</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              placeholder="Seu CEP"
              maxLength={8}
              disabled={isFetching}
              {...register('zipCode')}
              onBlur={handleCepBlur}
            />
            <InputError field={errors.zipCode} />
          </div>

          <div className="col-span-full grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" placeholder="Seu estado" disabled={isFetching} {...register('state')} />
              <InputError field={errors.state} />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" placeholder="Sua cidade" disabled={isFetching} {...register('city')} />
              <InputError field={errors.city} />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" placeholder="Seu bairro" disabled={isFetching} {...register('neighborhood')} />
              <InputError field={errors.neighborhood} />
            </div>

            <div>
              <Label htmlFor="street">Rua</Label>
              <Input id="street" placeholder="Nome da sua rua" disabled={isFetching} {...register('street')} />
              <InputError field={errors.street} />
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" placeholder="Número da sua casa" {...register('number')} />
              <InputError field={errors.number} />
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" placeholder="Complemento" {...register('complement')} />
              <InputError field={errors.complement} />
            </div>
          </div>
        </div>

        <Button className="h-9 min-w-28 w-fit" isLoading={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
