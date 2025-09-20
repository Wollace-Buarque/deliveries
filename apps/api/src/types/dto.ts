import { UserRole, DeliveryStatus } from '@deliveries/shared';

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    name: string;
    phone: string;
    document: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  profile?: {
    name?: string;
    phone?: string;
    document?: string;
    avatar?: string;
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      coordinates?: {
        lat?: number;
        lng?: number;
      };
    };
  };
}

// Delivery DTOs
export interface CreateDeliveryDto {
  clientId: string;
  origin: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  value: number;
  estimatedTime?: number;
}

export interface UpdateDeliveryDto {
  status?: DeliveryStatus;
  deliveryId?: string;
  actualTime?: number;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends CreateUserDto {}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    role: UserRole;
    profile: {
      name: string;
      phone: string;
      avatar?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

// Query DTOs
export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface DeliveryFiltersDto extends PaginationDto {
  status?: DeliveryStatus;
  clientId?: string;
  deliveryId?: string;
}

export interface UserFiltersDto extends PaginationDto {
  role?: UserRole;
}
