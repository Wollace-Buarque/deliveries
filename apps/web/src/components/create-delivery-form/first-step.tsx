import { KeyboardEvent } from 'react'
import { FieldError } from 'react-hook-form'

import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { Label } from '../forms/label'
import { Button } from '../button'
import { CreateDeliveryFormSchema } from './create-delivery-form'

interface FirstStepProps {
  register: (name: keyof CreateDeliveryFormSchema) => any
  handleNextStep: () => Promise<void>
  isSubmitting: boolean
  errors: {
    [key in keyof CreateDeliveryFormSchema]?: FieldError
  }
}

export function FirstStep({ register, handleNextStep, isSubmitting, errors }: FirstStepProps) {
  function handleEnterKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return
    handleNextStep()
  }

  return (
    <>
      <div>
        <Label htmlFor="description">Descrição da Entrega</Label>

        <textarea
          id="description"
          className="min-h-20 w-full resize-none rounded-sm border border-zinc-400 bg-zinc-100 px-4 py-2 text-sm placeholder-zinc-500 outline-sky-400 disabled:bg-zinc-200"
          placeholder="Descreva o que será entregue..."
          onKeyDown={handleEnterKeyDown}
          {...register('description')}
        />

        <InputError field={errors.description} />
      </div>

      <div>
        <Label htmlFor="value">Valor da Entrega (R$)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          id="value"
          placeholder="0.00"
          onKeyDown={handleEnterKeyDown}
          {...register('value')}
        />
        <InputError field={errors.value} />
      </div>

      <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
        Continuar
      </Button>
    </>
  )
}
