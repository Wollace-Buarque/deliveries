import { FocusEvent, useState } from 'react'

import { Label } from '../forms/label'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { Button } from '../button'

import { fetchAddressByZipCode } from '@/lib/utils'

interface ThirdStepProps {
  register: (name: any) => any
  setValue: (name: any, value: any) => void
  clearErrors: (name: any[]) => void
  handleBackStep: () => void
  isSubmitting: boolean
  errors: {
    [key: string]: any
  }
}

export function ThirdStep({ register, setValue, clearErrors, isSubmitting, errors, handleBackStep }: ThirdStepProps) {
  const [isFetching, setIsFetching] = useState(false)

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const cep = event.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsFetching(true)

    const addressData = await fetchAddressByZipCode(cep)

    if (setValue && addressData) {
      setValue('destination.street', addressData.street)
      setValue('destination.neighborhood', addressData.neighborhood)
      setValue('destination.city', addressData.city)
      setValue('destination.state', addressData.state)
      clearErrors(['destination.street', 'destination.neighborhood', 'destination.city', 'destination.state'])
    }

    setIsFetching(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-zinc-800">Endereço de Destino</h3>

      <div>
        <Label htmlFor="destination.zipCode">CEP</Label>
        <Input
          type="text"
          id="destination.zipCode"
          placeholder="Digite o CEP"
          {...register('destination.zipCode')}
          onBlur={handleCepBlur}
          disabled={isFetching}
        />
        <InputError field={errors?.destination?.zipCode} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="destination.street">Rua</Label>
          <Input
            type="text"
            id="destination.street"
            placeholder="Ex: Avenida Paulista"
            {...register('destination.street')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.street} />
        </div>

        <div>
          <Label htmlFor="destination.neighborhood">Bairro</Label>
          <Input
            type="text"
            id="destination.neighborhood"
            placeholder="Ex: Bela Vista"
            {...register('destination.neighborhood')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.neighborhood} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="destination.city">Cidade</Label>
          <Input
            type="text"
            id="destination.city"
            placeholder="Ex: São Paulo"
            {...register('destination.city')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.city} />
        </div>

        <div>
          <Label htmlFor="destination.state">Estado</Label>
          <Input
            type="text"
            id="destination.state"
            placeholder="Ex: SP"
            maxLength={2}
            {...register('destination.state')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.state} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="destination.number">Número</Label>
          <Input
            type="text"
            id="destination.number"
            placeholder="Ex: 1000"
            {...register('destination.number')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.number} />
        </div>

        <div>
          <Label htmlFor="destination.complement">Complemento</Label>
          <Input
            type="text"
            id="destination.complement"
            placeholder="Ex: Torre A"
            {...register('destination.complement')}
            disabled={isFetching}
          />
          <InputError field={errors?.destination?.complement} />
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={handleBackStep} disabled={isSubmitting}>
          Voltar
        </Button>

        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? 'Criando entrega...' : 'Criar Entrega'}
        </Button>
      </div>
    </div>
  )
}
