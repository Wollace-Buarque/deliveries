export {
	updateDeliverySchema,
	type UpdateDeliveryDto
} from './schemas/updateDelivery';
export {
	updateUserSchema,
	type UpdateUserDto
} from './schemas/updateUser';
// Export domain types (entidades, eventos, etc)
export * from './types';

// Export Zod schemas e tipos derivados (apenas tipos, não schemas duplicados)
export {
	createUserSchema,
	loginSchema,
	userProfileSchema,
	type CreateUserDto,
	type LoginDto,
	type UserProfileDto
} from './schemas/user';
export {
	createDeliverySchema,
	updateDeliveryStatusSchema,
	addressSchema,
	type CreateDeliveryDto,
	type UpdateDeliveryStatusDto,
	type AddressDto
} from './schemas/delivery';

// Export utilitários (apenas funções)
export {
	calculateDistance,
	calculateEstimatedTime,
	createApiResponse,
	createPaginatedResponse
} from './utils';
