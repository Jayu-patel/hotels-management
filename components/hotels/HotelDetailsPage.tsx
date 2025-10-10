"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Bed, 
  Bath,
  Calendar,
  Check,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { RoomCard } from './RoomCard';
import { BookingModal } from './BookingModal';
import { toast } from 'react-toastify';
import Navbar from '@/components/navbar'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';


interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrls: string[];
  amenities: string[];
  address: string;
}

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description: string;
  imageUrls: string[];
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string[];
  available: boolean;
}

interface HotelDetailsPageProps {
  hotel: Hotel;
  rooms: Room[]
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Restaurant': <Coffee className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
};

export default function HotelDetailsPage({ hotel, rooms }: HotelDetailsPageProps) {
  const {user} = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const router = useRouter()
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const nextImage = () => {
    if(hotel)
    setCurrentImageIndex((prev) => (prev + 1) % hotel.imageUrls.length);
  };

  const prevImage = () => {
    if(hotel)
    setCurrentImageIndex((prev) => (prev - 1 + hotel.imageUrls.length) % hotel.imageUrls.length);
  };

  const handleRoomSelect = (room: Room) => {
    if (!user) {
      const redirectTo = encodeURIComponent(window.location.href);
      // console.log("redirecttt: ", redirectTo)
      // router.push("/login")
      router.push(`/login?redirectTo=${redirectTo}`);
      toast.warn("Login required to book a room.");
      return
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (bookingData: any) => {
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={()=>{router.back()}} className="flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Hotels
          </Button>
        </div>

        {/* Hotel Images */}
        <div className="mb-8">
          {/* Main Image with Navigation */}
          <div className="relative mb-4">
            <div className='w-full h-64 sm:h-80 lg:h-96 relative'>
              <Image
                fill
                src={hotel?.imageUrls[currentImageIndex]}
                alt={hotel?.name}
                className="object-cover rounded-lg"
              />
            </div>
            
            {hotel?.imageUrls?.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {hotel?.imageUrls.length}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {hotel?.imageUrls.map((url, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square ${
                  index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <div className='relative w-full h-full'>
                  <Image
                    fill
                    src={url}
                    alt={`${hotel.name} ${index + 1}`}
                    className="object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-blue-500/20" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Hotel Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl mb-2">{hotel?.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm sm:text-base">{hotel?.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{hotel?.rating}</span>
                      <span className="text-sm">({hotel?.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                
                {/* <div className="flex gap-2 self-start">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div> */}
              </div>
              
              <p className="text-gray-700 leading-relaxed">{hotel?.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl mb-4">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                    {<Check className="h-4 w-4" />}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Available Rooms */}
            <div>
              <h2 className="text-xl mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelect={() => handleRoomSelect(room)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {/* <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Hotel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div>
                  <h4 className="text-sm mb-1">Check-in</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                      3:00 PM
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm mb-1">Check-out</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    11:00 AM
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm mb-2">Contact & Location</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{hotel?.address}</p>
                    <p>+1 (555) 123-4567</p>
                    <p>info@grandluxuryhotel.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedRoom && hotel && user && (
          <BookingModal
            room={selectedRoom}
            hotel={hotel}
            userId={user.id}
            onClose={() => setShowBookingModal(false)}
            onSubmit={handleBookingSubmit}
            dates={{from: checkIn ?? "", to: checkOut ?? ""}}
          />
        )}
      </div>
    </div>
  );
}