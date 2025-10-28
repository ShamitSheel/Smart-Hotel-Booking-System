export interface Address {
  street: string;
  area?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface HotelPolicies {
  checkInTime: string;  
  checkOutTime: string; 
  cancellationPolicy: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
}

export interface Room {
  id: string;
  name: string; 
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  totalPriceIncludesTaxes: number;
  maxGuests: number;
  bedType: string; 
  amenities: string[]; 
  images: string[];
  isAvailable: boolean;
  quantityAvailable: number;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: Address;
  type?: 'HOTEL' | 'APARTMENT' | 'VILLA' | 'RESORT' | 'COTTAGE' | 'CABIN' | 'GUEST HOUSE' | 'HOSTEL' | 'PALACE';
  features: string[]; 
  amenities: string[]; 
  rating: number;
  reviews: number;
  images: string[];
  primaryImage?:string;
  isFullyRefundable: boolean;
  hasFreeBreakfast: boolean;
  reserveNowPayLater: boolean;
  policies: HotelPolicies;
  rooms: Room[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  availabilityMessage?: string;
  managerId?: string;
}