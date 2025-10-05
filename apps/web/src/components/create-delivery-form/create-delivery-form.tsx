'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'

import { isValidZipCode } from '@/lib/validators'
import { handleAddressLookup } from '@/lib/utils'
import { createDelivery } from '@/app/actions/deliveries'
import { Button } from '@/components/button'
import { IconX } from '@tabler/icons-react'
import { FirstStep } from './first-step'
import { SecondStep } from './second-step'
import { ThirdStep } from './third-step'

enum CreateDeliveryStep {
  BASIC_INFO,
  ORIGIN_ADDRESS,
  DESTINATION_ADDRESS
}

const coordinatesSchema = z.object({
  lat: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'),
  lng: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida')
})

const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z
    .string()
    .min(8, 'CEP deve ter no mínimo 8 dígitos')
    .refine((value) => isValidZipCode(value), { message: 'CEP inválido' }),
  coordinates: coordinatesSchema
})

export const createDeliveryFormSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
  description: z.string().min(1, 'Descrição é obrigatória'),
  value: z.coerce.number().min(0.01, 'Valor é obrigatório')
})

export type CreateDeliveryFormSchema = z.infer<typeof createDeliveryFormSchema>

export function CreateDeliveryForm() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<CreateDeliveryStep>(CreateDeliveryStep.BASIC_INFO)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    clearErrors,
    trigger
  } = useForm({
    resolver: zodResolver(createDeliveryFormSchema),
    mode: 'onTouched',
    defaultValues: {
      origin: {
        coordinates: { lat: 0, lng: 0 }
      },
      destination: {
        coordinates: { lat: 0, lng: 0 }
      }
    }
  })

  async function handleNextStep() {
    if (step === CreateDeliveryStep.BASIC_INFO) {
      const isBasicInfoValid = await trigger(['description', 'value'])
      if (!isBasicInfoValid) return

      setStep(CreateDeliveryStep.ORIGIN_ADDRESS)
    } else if (step === CreateDeliveryStep.ORIGIN_ADDRESS) {
      const isOriginValid = await trigger([
        'origin.street',
        'origin.number',
        'origin.neighborhood',
        'origin.city',
        'origin.state',
        'origin.zipCode'
      ])
      if (!isOriginValid) return

      setStep(CreateDeliveryStep.DESTINATION_ADDRESS)
    }
  }

  function handleBackStep() {
    if (step === CreateDeliveryStep.ORIGIN_ADDRESS) {
      setStep(CreateDeliveryStep.BASIC_INFO)
    } else if (step === CreateDeliveryStep.DESTINATION_ADDRESS) {
      setStep(CreateDeliveryStep.ORIGIN_ADDRESS)
    }
  }

  async function handleCreateDelivery(data: CreateDeliveryFormSchema) {
    try {
      const originCoords = await handleAddressLookup({
        street: data.origin.street,
        number: data.origin.number,
        neighborhood: data.origin.neighborhood,
        city: data.origin.city,
        state: data.origin.state,
        zipCode: data.origin.zipCode
      })

      if (!originCoords.lat || !originCoords.lng) {
        return toast.error('Erro ao obter coordenadas da origem. Verifique o endereço e tente novamente.')
      }

      const destinationCoords = await handleAddressLookup({
        street: data.destination.street,
        number: data.destination.number,
        neighborhood: data.destination.neighborhood,
        city: data.destination.city,
        state: data.destination.state,
        zipCode: data.destination.zipCode
      })

      if (!destinationCoords.lat || !destinationCoords.lng) {
        return toast.error('Erro ao obter coordenadas do destino. Verifique o endereço e tente novamente.')
      }

      if (isSameAddress(data.origin, data.destination)) {
        return toast.error('O endereço de origem e destino não podem ser o mesmo.')
      }

      const deliveryData = {
        ...data,
        origin: {
          ...data.origin,
          coordinates: { lat: Number(originCoords.lat), lng: Number(originCoords.lng) }
        },
        destination: {
          ...data.destination,
          coordinates: { lat: Number(destinationCoords.lat), lng: Number(destinationCoords.lng) }
        }
      }

      const response = await createDelivery(deliveryData)
      if (!response.success) return toast.error(response.message)

      toast.success('Entrega criada com sucesso!')
      reset()
      setOpen(false)

      router.refresh()
    } catch (error) {
      toast.error('Erro interno do servidor. Tente novamente.')
    }
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)

    if (!open) {
      reset()
      setStep(CreateDeliveryStep.BASIC_INFO)
    }
  }

  function getStepTitle() {
    switch (step) {
      case CreateDeliveryStep.BASIC_INFO:
        return 'Informações Básicas'
      case CreateDeliveryStep.ORIGIN_ADDRESS:
        return 'Endereço de Origem'
      case CreateDeliveryStep.DESTINATION_ADDRESS:
        return 'Endereço de Destino'
      default:
        return 'Criar Nova Entrega'
    }
  }

  function getStepDescription() {
    switch (step) {
      case CreateDeliveryStep.BASIC_INFO:
        return 'Descreva a entrega e informe o valor.'
      case CreateDeliveryStep.ORIGIN_ADDRESS:
        return 'Informe o endereço de onde a entrega será coletada.'
      case CreateDeliveryStep.DESTINATION_ADDRESS:
        return 'Informe o endereço de destino da entrega.'
      default:
        return ''
    }
  }

  function isSameAddress(
    origin: CreateDeliveryFormSchema['origin'],
    destination: CreateDeliveryFormSchema['destination']
  ) {
    return (
      origin.street === destination.street &&
      origin.number === destination.number &&
      origin.neighborhood === destination.neighborhood &&
      origin.city === destination.city &&
      origin.state === destination.state &&
      origin.zipCode === destination.zipCode
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button className="bg-sky-600 text-white hover:bg-sky-700">Criar Entrega</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/50" />

        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-semibold text-zinc-800">{getStepTitle()}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-zinc-600">{getStepDescription()}</Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-700">
                <IconX size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(handleCreateDelivery)} className="space-y-6">
            <div className="flex w-full flex-col gap-3">
              {step === CreateDeliveryStep.BASIC_INFO && (
                <FirstStep
                  register={register}
                  errors={errors as any}
                  isSubmitting={isSubmitting}
                  handleNextStep={handleNextStep}
                />
              )}

              {step === CreateDeliveryStep.ORIGIN_ADDRESS && (
                <SecondStep
                  register={register}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  handleBackStep={handleBackStep}
                  handleNextStep={handleNextStep}
                  setValue={setValue}
                  clearErrors={clearErrors}
                />
              )}

              {step === CreateDeliveryStep.DESTINATION_ADDRESS && (
                <ThirdStep
                  register={register}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  handleBackStep={handleBackStep}
                  setValue={setValue}
                  clearErrors={clearErrors}
                />
              )}
            </div>

            {step === CreateDeliveryStep.BASIC_INFO && (
              <div className="flex justify-end gap-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Dialog.Close>
              </div>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
