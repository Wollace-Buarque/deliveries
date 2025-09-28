import { FieldError } from 'react-hook-form'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { SignUpSchema } from './signup-form'
import { Label } from '../forms/label'
import { Button } from '../button'

interface FirstStepProps {
  register: (name: keyof SignUpSchema) => any
  handleNextStep: () => Promise<void>
  isSubmitting: boolean
  errors: {
    [key in keyof SignUpSchema]?: FieldError
  }
}

export function FirstStep({ register, handleNextStep, isSubmitting, errors }: FirstStepProps) {
  return (
    <>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input type="email" id="email" placeholder="Digite seu e-mail" {...register('email')} />
        <InputError field={errors.email} />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input type="password" id="password" placeholder="Digite sua senha" {...register('password')} />
        <InputError field={errors.password} />
      </div>

      <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
        Juntar-se a nós
      </Button>
    </>
  )
}
