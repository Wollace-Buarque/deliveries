import { FocusEvent, useState } from 'react'

import { Label } from '../forms/label'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { Button } from '../button'

import { fetchAddressByZipCode } from '@/lib/utils'

interface SecondStepProps {
  register: (name: any) => any
  setValue: (name: any, value: any) => void
  clearErrors: (name: any[]) => void
  handleBackStep: () => void
  handleNextStep: () => Promise<void>
  isSubmitting: boolean
  errors: {
    [key: string]: any
  }
}

export function SecondStep({
  register,
  setValue,
  clearErrors,
  isSubmitting,
  errors,
  handleBackStep,
  handleNextStep
}: SecondStepProps) {
  const [isFetching, setIsFetching] = useState(false)

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const cep = event.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsFetching(true)

    const addressData = await fetchAddressByZipCode(cep)

    if (setValue && addressData) {
      setValue('origin.street', addressData.street)
      setValue('origin.neighborhood', addressData.neighborhood)
      setValue('origin.city', addressData.city)
      setValue('origin.state', addressData.state)
      clearErrors(['origin.street', 'origin.neighborhood', 'origin.city', 'origin.state'])
    }

    setIsFetching(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-zinc-800">Endereço de Origem</h3>

      <div>
        <Label htmlFor="origin.zipCode">CEP</Label>
        <Input
          type="text"
          id="origin.zipCode"
          placeholder="Digite o CEP"
          maxLength={8}
          {...register('origin.zipCode')}
          onBlur={handleCepBlur}
          disabled={isFetching}
        />
        <InputError field={errors?.origin?.zipCode} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="origin.street">Rua</Label>
          <Input
            type="text"
            id="origin.street"
            placeholder="Ex: Rua das Flores"
            {...register('origin.street')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.street} />
        </div>
        <div>
          <Label htmlFor="origin.neighborhood">Bairro</Label>
          <Input
            type="text"
            id="origin.neighborhood"
            placeholder="Ex: Centro"
            {...register('origin.neighborhood')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.neighborhood} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="origin.city">Cidade</Label>
          <Input
            type="text"
            id="origin.city"
            placeholder="Ex: São Paulo"
            {...register('origin.city')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.city} />
        </div>
        <div>
          <Label htmlFor="origin.state">Estado</Label>
          <Input
            type="text"
            id="origin.state"
            placeholder="Ex: SP"
            maxLength={2}
            {...register('origin.state')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.state} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="origin.number">Número</Label>
          <Input
            type="text"
            id="origin.number"
            placeholder="Ex: 123"
            {...register('origin.number')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.number} />
        </div>
        <div>
          <Label htmlFor="origin.complement">Complemento</Label>
          <Input
            type="text"
            id="origin.complement"
            placeholder="Ex: Apto 45"
            {...register('origin.complement')}
            disabled={isFetching}
          />
          <InputError field={errors?.origin?.complement} />
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={handleBackStep} disabled={isSubmitting}>
          Voltar
        </Button>

        <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
