
export enum PropertyType {
  LAND = 'Terreno',
  HOUSE = 'Casa',
  APARTMENT = 'Apartamento',
  COMMERCIAL = 'Comercial'
}

export enum ListingMode {
  SELL = 'Venda',
  RENT = 'Aluguel'
}

export enum VisitStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  REJECTED = 'Recusado'
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  referencePoint?: string;
  city: string;
  state: string;
}

export interface ValuationResult {
  fastSell: { min: number; max: number; justification: string };
  maxProfit: { min: number; max: number; justification: string };
  rentalOption?: { suggestedValue: number; yieldEstimate: string; justification: string };
  marketContext: string;
  liquidityAnalysis: {
    ratio: number;
    status: 'Ótimo' | 'Bom' | 'Alto';
    advice: string;
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: Address;
  phone: string;
  type: PropertyType;
  listingMode: ListingMode;
  area: number;
  images: string[];
  features: string[];
  sellerName: string;
  sellerId: string;
  rating: number;
  recommendations?: ValuationResult;
  createdAt?: any;
  coordinates: { lat: number; lng: number };
}

export interface ChatRoom {
  id: string;
  propertyId: string;
  propertyTitle: string;
  participants: string[]; // [buyerId, sellerId]
  lastMessage?: string;
  updatedAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'buyer' | 'seller';
  text: string;
  timestamp: Date;
}
