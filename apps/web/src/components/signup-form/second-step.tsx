import { FocusEvent, useState } from 'react'
import { Label } from '../forms/label'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { SignUpSchema } from './signup-form'
import { FieldError } from 'react-hook-form'
import { Button } from '../button'

interface FirstStepProps {
  register: (name: keyof SignUpSchema) => any
  setValue: (name: keyof SignUpSchema, value: any) => void
  clearErrors: (name: (keyof SignUpSchema)[]) => void
  handleBackStep: () => void
  isSubmitting: boolean
  errors: {
    [key in keyof SignUpSchema]?: FieldError
  }
  watch?: (name: string) => any
}

export function SecondStep({ register, setValue, clearErrors, isSubmitting, errors, handleBackStep }: FirstStepProps) {
  const [isFetching, setIsFetching] = useState(false)

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const cep = event.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsFetching(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()

      if (setValue && !data.erro) {
        setValue('street', data.logradouro || '')
        setValue('neighborhood', data.bairro || '')
        setValue('city', data.localidade || '')
        setValue('state', data.uf || '')
        clearErrors(['street', 'neighborhood', 'city', 'state'])
      }
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input type="text" placeholder="Digite seu nome" {...register('name')} />
        <InputError field={errors.name} />
      </div>

      <div>
        <Label htmlFor="phone">Celular</Label>
        <Input type="text" placeholder="Digite seu celular" {...register('phone')} />
        <InputError field={errors.phone} />
      </div>

      <div>
        <Label htmlFor="document">CPF</Label>
        <Input type="text" placeholder="Digite seu CPF" {...register('document')} />
        <InputError field={errors.document} />
      </div>

      <div>
        <Label htmlFor="zipCode">CEP</Label>
        <Input
          type="text"
          placeholder="Digite seu CEP"
          {...register('zipCode')}
          onBlur={handleCepBlur}
          disabled={isFetching}
        />
        <InputError field={errors.zipCode} />
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input type="text" placeholder="Digite sua rua/avenida" {...register('street')} disabled={isFetching} />
          <InputError field={errors.street} />
        </div>
        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input type="text" placeholder="Digite seu bairro" {...register('neighborhood')} disabled={isFetching} />
          <InputError field={errors.neighborhood} />
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input type="text" placeholder="Digite sua cidade" {...register('city')} disabled={isFetching} />
          <InputError field={errors.city} />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input type="text" placeholder="Digite seu estado" maxLength={2} {...register('state')} disabled={isFetching} />
          <InputError field={errors.state} />
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input type="text" placeholder="Digite seu número" {...register('number')} disabled={isFetching} />
          <InputError field={errors.number} />
        </div>

        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input type="text" placeholder="Digite seu complemento" {...register('complement')} disabled={isFetching} />
          <InputError field={errors.complement} />
        </div>
      </div>

      <div className="mt-2 flex justify-between gap-2">
        <Button
          type="button"
          className="bg-zinc-300 text-zinc-700 enabled:hover:bg-zinc-400"
          onClick={handleBackStep}
          disabled={isSubmitting}
        >
          Voltar
        </Button>

        <Button type="submit" isLoading={isSubmitting}>
          Cadastrar
        </Button>
      </div>
    </div>
  )
}
