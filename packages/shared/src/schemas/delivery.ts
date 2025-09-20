import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(8, 'Invalid zip code'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })
});

export const createDeliverySchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  origin: addressSchema,
  destination: addressSchema,
  description: z.string().min(1, 'Description is required'),
  value: z.number().min(0, 'Value must be positive'),
  estimatedTime: z.number().optional(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'ACCEPTED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
  ]),
  actualTime: z.number().optional()
});

export type CreateDeliveryDto = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryStatusDto = z.infer<typeof updateDeliveryStatusSchema>;
export type AddressDto = z.infer<typeof addressSchema>;
