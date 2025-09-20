// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  document: string;
  address: Address;
}

export type UserRole = 'CLIENT' | 'DELIVERY' | 'ADMIN';

// Delivery Types
export interface Delivery {
  id: string;
  clientId: string;
  deliveryId?: string;
  status: DeliveryStatus;
  origin: Address;
  destination: Address;
  description: string;
  value: number;
  estimatedTime: number;
  actualTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DeliveryStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CANCELLED';

// Address Types
export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Message Types
export interface Message {
  id: string;
  deliveryId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: Date;
}

export type MessageType = 'TEXT' | 'IMAGE';


// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Event Types
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  timestamp: Date;
  version: number;
}

export interface DeliveryAcceptedEvent extends DomainEvent {
  type: 'DELIVERY_ACCEPTED';
  data: {
    deliveryId: string;
    deliveryPersonId: string;
    clientId: string;
  };
}

export interface DeliveryStatusChangedEvent extends DomainEvent {
  type: 'DELIVERY_STATUS_CHANGED';
  data: {
    deliveryId: string;
    oldStatus: DeliveryStatus;
    newStatus: DeliveryStatus;
    changedBy: string;
  };
}
