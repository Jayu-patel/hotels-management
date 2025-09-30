"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, Search, Star, Wifi, Car, Coffee, Dumbbell, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useHotels } from "@/contexts/hotels-context";
import { getHotels } from "@/supabase/hotels";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ResponsiveSkeleton from '@/components/responsiveSkeleton';

interface SearchCriteria {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
}

interface errorType{
  destination?: string,
  checkIn?: string,
  checkOut?: string,
  guest?: string,
}

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

const topDestinations = [
  {
    name: "New York",
    hotels: "120+ hotels",
    imageUrl:
      "https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Miami",
    hotels: "80+ hotels",
    imageUrl:
      "https://images.unsplash.com/photo-1678687114989-ad452a24f289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Aspen",
    hotels: "45+ hotels",
    imageUrl:
      "https://images.unsplash.com/photo-1689729830276-6b8a3fe230f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Las Vegas",
    hotels: "200+ hotels",
    imageUrl:
      "https://images.unsplash.com/photo-1722409195473-d322e99621e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const amenityIcons: { [key: string]: React.ReactNode } = {
  "WiFi": <Wifi className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Restaurant": <Coffee className="h-4 w-4" />,
  "Gym": <Dumbbell className="h-4 w-4" />,
};

export default function HomePage() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  // const [guests, setGuests] = useState(1);
  const [guest, setGuest] = useState<GuestCount>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<errorType>({ destination: "", checkIn: "", checkOut: "", guest: "" })

  const router = useRouter();

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true)
      try {
        const {data: hotels} = await getHotels();
        setFeaturedHotels(hotels.slice(0, 3));
      } catch (err: any) {
        toast.error(err)
      }
      finally{
        setLoading(false)
      }
    }
    fetchHotels();
  }, []);

  const handleSearch = async() => {

    setErrors({});

    let newErrors : errorType = {};

    if (!destination.trim()) {
      newErrors.destination = "Destination is required.";
    }

    if (!checkIn) {
      newErrors.checkIn = "Please select a check-in date.";
    }

    if (!checkOut) {
      newErrors.checkOut = "Please select a check-out date.";
    } else if (checkIn && checkOut <= checkIn) {
      newErrors.checkOut = "Check-out date must be after check-in date.";
    }

    if (!guest) {
      newErrors.guest = "Please select at least one guest.";
    } 
    else {
      const totalGuests = guest.adults + guest.children + guest.infants;

      if (guest.adults < 1) {
        newErrors.guest = "At least one adult is required.";
      } else if (totalGuests > 10) {
        newErrors.guest = "Maximum 10 guests allowed.";
      }
    }


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // stop form submit
    }

    const totalGuests = guest.adults + guest.children + guest.infants;

    router.push(`/search?destination=${destination}&checkIn=${checkIn?.toISOString()}&checkOut=${checkOut?.toISOString()}&adults=${guest.adults}&children=${guest.children}&infants=${guest.infants}`);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-[500px] bg-cover bg-center relative rounded-xl overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200")',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl mb-4">Find Your Perfect Stay</h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Discover amazing hotels worldwide with the best prices guaranteed
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
       {/* Guests */}
        <Card className="relative -mt-20 mx-4 bg-white shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Destination */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </label>
                  <Input
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                  {errors.destination && (
                    <p className="text-xs text-red-500">{errors.destination}</p>
                  )}
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <label className="text-sm">Check-in</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? checkIn.toLocaleDateString("en-GB") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        // disabled={(date) => date < new Date()}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // reset time → 00:00:00

                          return date < today || date < new Date("1900-01-01");
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.checkIn && (
                    <p className="text-xs text-red-500">{errors.checkIn}</p>
                  )}
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <label className="text-sm">Check-out</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? checkOut.toLocaleDateString("en-GB") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < new Date() || (checkIn !== undefined && date <= checkIn)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.checkOut && (
                    <p className="text-xs text-red-500">{errors.checkOut}</p>
                  )}
                </div>

                {/* Guests */}
                <div className="space-y-2 relative">
                  <label className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Guests
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left"
                      >
                        <span>
                          {guest.adults + guest.children + guest.infants} Guest
                          {guest.adults + guest.children + guest.infants > 1 ? 's' : ''}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4">
                      <div className="space-y-4">
                        {([
                          { label: 'Adults', key: 'adults', min: 1, max: 10 },
                          { label: 'Children', key: 'children', min: 0, max: 5 },
                          { label: 'Infants', key: 'infants', min: 0, max: 5 },
                        ] as const).map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs text-gray-500">
                                {item.label === 'Adults'
                                  ? 'Ages 13+'
                                  : item.label === 'Children'
                                  ? 'Ages 2-12'
                                  : 'Under 2'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={guest[item.key as keyof GuestCount] <= item.min}
                                onClick={() =>
                                  setGuest((prev) => ({
                                    ...prev,
                                    [item.key]: Math.max(
                                      prev[item.key as keyof GuestCount] - 1,
                                      item.min
                                    ),
                                  }))
                                }
                              >
                                -
                              </Button>
                              <span>{guest[item.key as keyof GuestCount]}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  guest[item.key as keyof GuestCount] >= item.max ||
                                  guest.adults + guest.children + guest.infants >= 10
                                }
                                onClick={() =>
                                  setGuest((prev) => ({
                                    ...prev,
                                    [item.key]: Math.min(
                                      prev[item.key as keyof GuestCount] + 1,
                                      item.max
                                    ),
                                  }))
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.guest && (
                    <p className="text-xs text-red-500">{errors.guest}</p>
                  )}
                </div>

              </div>

              <Button onClick={handleSearch} className="w-full md:w-auto cursor-pointer" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Search Hotels
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Hotels */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl">Featured Hotels</h2>
          <Link href="/hotels">
            <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
              View All Hotels
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {
          loading ? 
          <ResponsiveSkeleton variant="card" count={1} size="sm" responsive /> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={()=>{router.push(`/hotels/${hotel?.id}`)}}>
                <div className="aspect-video relative">
                  <Image 
                    fill
                    src={`/api/image-proxy?url=${hotel.hotel_images?.find((img: any) => img.is_primary)?.image_url || hotel.hotel_images?.[0]?.image_url}`}
                    alt={hotel.name}
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {hotel.destination}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{hotel.star_rating}</span>
                      </div>
                      {/* <div className="text-right">
                        <span className="text-xl text-green-600">
                          ${hotel.rooms?.[0]?.price || 0}
                        </span>
                        <span className="text-sm text-gray-600">/ night</span>
                      </div> */}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hotel?.hotel_amenities?.slice(0, 3).map((amenity: any, i: number) =>{ 
                        return (
                        <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                          {amenityIcons[amenity.amenity_id.name]}
                          {amenity.amenity_id.name}
                        </Badge>
                      )})}
                      {hotel.amenities?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      </section>

      {/* Top Destinations */}
      {/* <section className="space-y-8">
        <h2 className="text-3xl text-center">Top Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topDestinations.map((destination) => (
            <Card
              key={destination.name}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-square relative">
                <div className="w-full h-full relative">
                  <Image
                    fill
                    src={`/api/image-proxy?url=${destination.imageUrl}`}
                    alt={destination.name}
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-lg">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.hotels}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section> */}

      {/* Features Section */}
      <section className="bg-blue-50 rounded-xl p-8 md:p-12">
        <div className="text-center space-y-8">
          <h2 className="text-3xl">Why Choose HotelBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl">Best Price Guarantee</h3>
              <p className="text-gray-600">
                We guarantee the lowest prices on hotel bookings. Find a lower price elsewhere and we&apos;ll match it.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl">Verified Reviews</h3>
              <p className="text-gray-600">
                All reviews are from real guests who have stayed at the hotels. No fake reviews, ever.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is available 24/7 to help you with any questions or issues.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}