
import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <div 
      className="bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-slate-100"
      onClick={() => onClick(property.id)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-6 left-6 bg-[#1a365d] text-[#c19a5b] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          {property.type}
        </div>
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-5 py-2 rounded-2xl text-[#1a365d] font-black shadow-xl border border-slate-100">
          R$ {property.price.toLocaleString('pt-BR')}
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-xl font-black text-[#1a365d] mb-2 group-hover:text-[#c19a5b] transition-colors tracking-tight">{property.title}</h3>
        <p className="text-slate-400 text-sm mb-6 flex items-center font-medium">
          <svg className="w-4 h-4 mr-2 text-[#c19a5b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex items-center space-x-3 text-[11px] font-black text-[#1a365d] uppercase tracking-widest">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-[#c19a5b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.area}m²
            </span>
          </div>
          <div className="flex items-center text-[#c19a5b]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1.5 text-xs font-black text-[#1a365d]">{property.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
