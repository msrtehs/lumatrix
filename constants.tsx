
import React from 'react';
import { Property, PropertyType, ListingMode } from './types';

export const COLORS = {
  primary: '#c19a5b', // Dourado/Ouro
  secondary: '#ffffff',
  accent: '#1a365d', // Azul Marinho
  dark: '#0f172a', // Marinho Profundo
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Terreno Lumatrix Prime',
    description: 'Excelente terreno plano em condomínio fechado, pronto para construir com a qualidade Lumatrix.',
    price: 250000,
    location: 'Interior, São Paulo',
    address: {
      cep: '12345-000',
      street: 'Rua das Flores',
      number: '100',
      neighborhood: 'Jardim das Palmeiras',
      city: 'Interior',
      state: 'SP',
      referencePoint: 'Próximo ao clube central'
    },
    phone: '(11) 99999-9999',
    type: PropertyType.LAND,
    listingMode: ListingMode.SELL,
    area: 500,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80'],
    features: ['Portaria 24h', 'Água encanada', 'Energia elétrica'],
    sellerName: 'Lumatrix Exclusive',
    sellerId: 's1',
    rating: 4.8,
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  {
    id: '2',
    title: 'Residência Aura Moderna',
    description: 'Casa de alto padrão com 3 suítes, acabamento premium em mármore e automação completa.',
    price: 1250000,
    location: 'Barueri, SP',
    address: {
      cep: '06401-000',
      street: 'Av. das Nações',
      number: '500',
      neighborhood: 'Alphaville',
      city: 'Barueri',
      state: 'SP',
      referencePoint: 'Em frente à praça principal'
    },
    phone: '(11) 98888-8888',
    type: PropertyType.HOUSE,
    listingMode: ListingMode.SELL,
    area: 320,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'],
    features: ['Piscina', 'Churrasqueira', 'Smart Home'],
    sellerName: 'Corretagem Lumatrix',
    sellerId: 's2',
    rating: 5.0,
    coordinates: { lat: -23.5062, lng: -46.8489 }
  },
  {
    id: '3',
    title: 'Apartamento Skyline Loft',
    description: 'Design sofisticado com vista panorâmica e acabamentos em tons de ouro e marinho.',
    price: 890000,
    location: 'Santos, SP',
    address: {
      cep: '11010-000',
      street: 'Av. da Praia',
      number: '10',
      neighborhood: 'Boqueirão',
      city: 'Santos',
      state: 'SP',
      referencePoint: 'Ao lado do canal 3'
    },
    phone: '(13) 97777-7777',
    type: PropertyType.APARTMENT,
    listingMode: ListingMode.SELL,
    area: 95,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80'],
    features: ['Vista Mar', 'Academia', 'Sauna'],
    sellerName: 'Lumatrix Litoral',
    sellerId: 's3',
    rating: 4.5,
    coordinates: { lat: -23.9608, lng: -46.3339 }
  }
];

export const Logo: React.FC<{ size?: string }> = ({ size = 'w-10 h-10' }) => (
  <div className={`${size} relative flex items-center justify-center transition-transform hover:scale-105`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
      <path d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" fill="#1a365d" fillOpacity="0.1" stroke="#1a365d" strokeWidth="2"/>
      <path d="M50 35L30 50V75H45V60H55V75H70V50L50 35Z" fill="#1a365d" />
      <path d="M50 35L30 50V75H70V50L50 35Z" stroke="#c19a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 65Q50 45 90 75" stroke="#c19a5b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="90" cy="70" r="4" fill="#c19a5b" />
    </svg>
  </div>
);
