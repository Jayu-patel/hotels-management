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
  ChevronRight,
  UserRound,
  CheckIcon,
  PersonStanding
} from 'lucide-react';
import { RoomCard } from './RoomCard';
import { BookingModal } from './BookingModal';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useCurrency } from '@/contexts/currency-context';
import { SearchBar } from '../searchForm';
import { getRoomsAvailability } from '@/supabase/hotels';
import ResponsiveSkeleton from '@/components/responsiveSkeleton';
import { cn } from '@/lib/utils';
import { useHotels } from '@/contexts/hotels-context';
import RoomGrid from './RoomGrid'
import HotelNav from './HotelNav';

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
  facilities: [];
  policies: [];
  check_in_time: string,
  check_out_time: string,
  phone: string,
  email: string,
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
  options: []
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

export default function HotelDetailsPage({ hotel, rooms: roomsData }: HotelDetailsPageProps) {
  const {user} = useAuth()
  const {setBookingData} = useHotels()
  const [rooms, setRooms] = useState(roomsData)
  const {currencyConverter, symbol, getEffectivePrice} = useCurrency()
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [roomChoice, setRoomChoice] = useState({})
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams();

  
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || formatDate(today));
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || formatDate(threeDaysLater));
  const [guest, setGuest] = useState({ adults: 2, children: 0, rooms: 1 })

  function formatTime(timeString: string) {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }


  const nextImage = () => {
    if(hotel)
    setCurrentImageIndex((prev) => (prev + 1) % hotel.imageUrls.length);
  };

  const prevImage = () => {
    if(hotel)
    setCurrentImageIndex((prev) => (prev - 1 + hotel.imageUrls.length) % hotel.imageUrls.length);
  };

  const handleRoomSelect = (room: Room, roomChoice?: any) => {
    if (!user) {
      const redirectTo = encodeURIComponent(window.location.href);
      // console.log("redirecttt: ", redirectTo)
      // router.push("/login")
      router.push(`/login?redirectTo=${redirectTo}`);
      toast.warn("Login required to book a room.");
      return
    }

    setRoomChoice(roomChoice)
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (bookingData: any) => {
  };

  const onSearch=async(checkInDate: string, checkOutDate: string, guest: {adults: number, children: number, rooms: number})=>{
    setLoading(true)
    try{
      const data = await getRoomsAvailability({
        hotelId: hotel.id, 
        checkIn: checkInDate, 
        checkOut: checkOutDate, 
        guestCount: (guest.adults + guest.children)
      })
      setRooms(data)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    scroll({top: 0, behavior: "instant"})
    setBookingData({})
  },[])

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => {
              router.back();
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hotels
          </Button>
        </div>

        <div className="p-4">
          <h1 className="text-2xl sm:text-3xl mb-2">{hotel?.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm sm:text-base">
                {hotel?.location}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{hotel?.rating}</span>
              <span className="text-sm">
                ({hotel?.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Images */}
        <div className="mb-8">
          {/* Main Image with Navigation */}
          <div className="relative mb-4">
            <div className="w-full h-64 sm:h-80 lg:h-96 relative">
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
                  index === currentImageIndex ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <div className="relative w-full h-full">
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
        
        <HotelNav />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8" id='overview'>
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Hotel Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                {/* <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl mb-2">{hotel?.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm sm:text-base">
                        {hotel?.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{hotel?.rating}</span>
                      <span className="text-sm">
                        ({hotel?.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div> */}

                {/* <div className="flex gap-2 self-start">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div> */}
              </div>

              <div
                // className="prose prose-sm mt-1 max-w-none [&_p,li]:text-sm md:[&_p,li]:text-lg [&_h2]:text-xl md:[&_h2]:text-2xl [&_ol]:list-disc [&_ol_li]:ml-4"
                className="prose prose-sm mt-1 max-w-none [&_p,li]:text-xs md:[&_p,li]:text-base [&_h2]:text-lg md:[&_h2]:text-xl [&_ol]:list-disc [&_ol_li]:ml-4"
                dangerouslySetInnerHTML={{ __html: hotel?.description }}
              />
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                What this place offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                  >
                    {<Check className="h-4 w-4" />}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available rooms */}

            <Separator />

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotel?.facilities?.map((section: any) => (
                <div key={section.title}>
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    {section.title}
                  </h3>

                  <ul className="space-y-1">
                    {section.items.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div> */}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 mt-3">
            <Card className="sticky top-34">
              <CardHeader>
                <CardTitle>Hotel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div>
                  <h4 className="text-sm mb-1">Check-in</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatTime(hotel?.check_in_time)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-1">Check-out</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatTime(hotel?.check_out_time)}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm mb-2">Contact & Location</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{hotel?.address}</p>
                    <p>{hotel?.phone}</p>
                    <p>{hotel?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Rooms */}
        {/* <div className="my-10">
          <h3 className="text-2xl font-semibold mb-4">Available Rooms</h3>
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={() => handleRoomSelect(room)}
              />
            ))}
          </div>
        </div> */}

        <div className="my-10" id='rooms'>
          <div className='my-6'>

            <SearchBar 
              checkIn={checkIn} 
              setCheckIn={setCheckIn}
              checkOut={checkOut} 
              setCheckOut={setCheckOut} 
              roomGuests={guest} 
              setRoomGuests={setGuest}
              onSearch={onSearch}
              className='w-full md:w-auto'
            />

          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Available Rooms</h3>
            <RoomGrid rooms={rooms} checkIn={checkIn} checkOut={checkOut} handleSelectRoom={handleRoomSelect} />
          </div>

          {/* <ResponsiveSkeleton variant="card" size="md" className="w-full sm:w-[300px] h-[220px] hidden md:block"/> */}
          {/* {
            loading ? <Skeleton count={2} className='space-y-4 hidden md:block' /> :
            <div className="hidden md:block overflow-x-auto border border-gray-300 rounded-lg">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 w-[30%]">Room Category</th>
                    <th className="p-3 w-[30%]">Your Options</th>
                    <th className="p-3 w-[10%] text-center">Guests</th>
                    <th className="p-3 w-[30%] text-right">Price</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room) =>
                    room.options.map((choice: any, index) => (
                      <tr
                        key={`${room.id}-${index}`}
                        className="border-t align-top"
                      >
                        {index === 0 && (
                          <td className="p-4" rowSpan={room.options.length}>
                            <div className="flex flex-col gap-2">
                              <img
                                src={room.imageUrls[0]}
                                alt={room.name}
                                className="w-40 h-28 object-cover rounded-md"
                              />
                              <div>
                                <p className="font-semibold">{room.name}</p>
                                <p className="text-sm text-gray-600">
                                  {room.type}
                                </p>

                                <div className='flex flex-wrap gap-x-3 w-full md:w-[80%] mt-2'>
                                  {
                                    room.amenities.map((amenity, i)=>{
                                      return <div key={i} className='flex items-center gap-1'>
                                        <CheckIcon className='w-3 h-3 text-green-600' />
                                        <p>{amenity}</p>
                                      </div>
                                    })
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        <td className="p-4">
                          <p className="font-medium">{choice.name}</p>
                          {
                            choice.additional_price > 0 &&
                            <p>{`( Aditional charges `}{symbol}{currencyConverter(getEffectivePrice({pricePerNight: choice.additional_price}, checkIn, checkOut)).toLocaleString()} {")"}</p>
                          }
                        </td>

                        <td className="p-4 text-center flex flex-wrap justify-center">
                          {Array.from({ length: guest.adults }).map((_, i) => (
                            <UserRound key={`adult-${i}`} className="h-4 w-4" />
                          ))}
                          {guest.children > 0 && <span className="mx-1 text-sm font-semibold">+</span>}

                          {Array.from({ length: guest.children }).map((_, i) => (
                            <PersonStanding key={`child-${i}`} className="h-4 w-4" />
                          ))}
                        </td>

                        <td className="p-4 text-right">
                          <p className="font-semibold text-lg">
                            {symbol}{currencyConverter(getEffectivePrice(room, checkIn, checkOut) + choice.additional_price).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            Price per night
                          </p>

                          {
                            room.available ?
                            <button
                              className="mt-2 py-1 px-10 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                              onClick={() => handleRoomSelect(room, choice)}
                              disabled={!(room.available)}
                            >
                              Select
                            </button> :
                            <p className='text-red-500'>Currently Unavailable</p>
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          }

          {
            loading ? <Skeleton count={2} className='block md:hidden' /> :
            <div className="block md:hidden space-y-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm"
                >
                  <img
                    src={room.imageUrls[0]}
                    alt={room.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <p className="font-semibold text-lg">{room.name}</p>
                  <p className="text-sm text-gray-600">{room.type}</p>
                  <div className="flex items-center gap-2 text-sm my-1">
                    <span>💼 benefits</span>
                    <a href="#" className="text-blue-600 font-medium">
                      Benefits Gain
                    </a>
                  </div>
                  <p className="text-green-600 text-sm mb-4">Room info</p>

                  {[  { title: "BB", price: 459.14 }, { title: "HB", price: 518.82 }, { title: "FB", price: 578.51 }, ].map((choice, index) => (
                    <div key={index} className="border-t pt-3 mt-3">
                      <p className="font-medium">{choice.title}</p>
                      <p className="text-red-600 text-sm mb-2">Non-Refundable</p>

                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="font-semibold text-lg">
                            ${choice.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            Total for 1 Night
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            // onClick={() => handleRoomSelect(room, choice)}
                            className="border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-50"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          } */}

        </div>

        {hotel?.facilities?.length > 0 && (
          <div className="my-10" id='facility'>
            <h3 className="text-2xl font-semibold mb-5">
              Facilities of {hotel.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotel?.facilities?.map((section: any) => (
                <div key={section.title}>
                  <h3 className="text-xl font-medium text-black mb-3 flex items-center gap-2">
                    {section.title}
                  </h3>

                  <ul className="space-y-1">
                    {section.items.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-black mt-0.5 shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {hotel?.policies?.length > 0 && (
          <div className="mt-3 mb-5" id='policies'>
            <h3 className="text-2xl font-semibold mb-5">Hotel Policies</h3>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border-3 space-y-6">
              {hotel?.policies?.map((policy: any, index) => {
                return (
                  <div key={policy.id}>
                    <div className="space-y-2">
                      <h2 className="text-base md:text-lg font-semibold">
                        {policy.title}
                      </h2>
                      <div
                        className="[&_p,li]:text-sm md:[&_p,li]:text-base [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-5 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: policy.description }}
                      />
                    </div>

                    {index < hotel?.policies?.length - 1 && (
                      <Separator className="w-full h-[1.5px] bg-foreground/20 my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedRoom && hotel && user && (
          <BookingModal
            room={selectedRoom}
            hotel={hotel}
            userId={user.id}
            onClose={() => setShowBookingModal(false)}
            onSubmit={handleBookingSubmit}
            dates={{ from: checkIn ?? "", to: checkOut ?? "" }}
            roomChoice={roomChoice}
            selectedGuest={guest}
          />
        )}
      </div>
      <div className="h-[60vh]" />
    </div>
  );
}

const Skeleton =({count = 1, className = ''})=>{
  return (
    <div className={cn("", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="flex items-center gap-4" key={i}>
          <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-32 w-44" /> {/* image */}
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
        </div>
      ))}

    </div>
  )
}