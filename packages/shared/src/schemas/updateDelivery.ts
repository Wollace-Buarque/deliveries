import { z } from 'zod'
import { createDeliverySchema } from './delivery'

export const updateDeliverySchema = createDeliverySchema.partial()
export type UpdateDeliveryDto = z.infer<typeof updateDeliverySchema>
