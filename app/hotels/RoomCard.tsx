"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bed, 
  Bath, 
  Maximize, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Wifi,
  Car,
  Coffee,
  Dumbbell
} from 'lucide-react';
import Image from 'next/image';

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description: string;
  imageUrls: string[];
  pricePerNight: number;
  originalPrice?: number;
  maxOccupancy: number;
  amenities: string[];
  available: boolean;
}

interface RoomCardProps {
  room: Room;
  onSelect: () => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-3 w-3" />,
  'Parking': <Car className="h-3 w-3" />,
  'Restaurant': <Coffee className="h-3 w-3" />,
  'Gym': <Dumbbell className="h-3 w-3" />,
};

export function RoomCard({ room, onSelect }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % room.imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + room.imageUrls.length) % room.imageUrls.length);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      room.available ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
    }`}>
      <div className="lg:flex">
        {/* Room Images */}
        <div className="lg:w-1/3 relative">
          <div className='w-full h-48 lg:h-full relative'>
            <Image
              fill
              src={`/api/image-proxy?url=${room.imageUrls[currentImageIndex]}`}
              alt={room.name}
              className="object-cover"
            />
          </div>
          
          {room.imageUrls.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8"
                onClick={prevImage}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8"
                onClick={nextImage}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
          
          {room.imageUrls.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {room.imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <Badge variant={room.type === 'Presidential' ? 'default' : 'secondary'}>
              {room.type}
            </Badge>
          </div>
        </div>
        
        {/* Room Details */}
        <CardContent className="lg:w-2/3 p-4 lg:p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl mb-1">{room.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{room.description}</p>
            </div>
            
            {!room.available && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Room Details */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to {room.maxOccupancy} guests</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.slice(0, 6).map((amenity) => (
              <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {amenityIcons[amenity] || <Check className="h-3 w-3" />}
                {amenity}
              </div>
            ))}
            {room.amenities.length > 6 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{room.amenities.length - 6} more
              </div>
            )}
          </div>

          {/* Pricing and Book Button */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl text-green-600">
                  ${room.pricePerNight}
                </span>
                <span className="text-sm text-gray-600">/ night</span>
              </div>
              <p className="text-xs text-gray-500">Includes taxes and fees</p>
            </div>
            
            <Button 
              onClick={onSelect}
              disabled={!room.available}
              className="w-full sm:w-auto min-w-[120px] cursor-pointer"
            >
              {room.available ? 'Book Room' : 'Unavailable'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}