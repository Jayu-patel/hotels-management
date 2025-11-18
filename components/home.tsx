"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, Search, Star, Wifi, Car, Coffee, Dumbbell, ArrowRight, StarIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ResponsiveSkeleton from '@/components/responsiveSkeleton';
import { supabase } from "@/lib/supabase/client";
import { CityCard } from "./home/CityCard";
import { Country } from "country-state-city";
import { useHotels } from "@/contexts/hotels-context";
import { DateRange } from "react-day-picker";

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
  ratings?: string
}

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  "WiFi": <Wifi className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Restaurant": <Coffee className="h-4 w-4" />,
  "Gym": <Dumbbell className="h-4 w-4" />,
};

export default function HomePage() {
  const {setBookingData} = useHotels()
  const [destination, setDestination] = useState("Mumbai");
  const [checkIn, setCheckIn] = useState<Date| undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(Date.now() + 24 * 60 * 60 * 1000 * 2));
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  // const [guests, setGuests] = useState(1);
  const [guest, setGuest] = useState<GuestCount>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([3,4,5]);

  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<errorType>({ destination: "", checkIn: "", checkOut: "", guest: "", ratings: "" })

  const router = useRouter();

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
      return;
    }

    const totalGuests = guest.adults + guest.children + guest.infants;

    router.push(`/search?destination=${destination}&checkIn=${checkIn?.toISOString()}&checkOut=${checkOut?.toISOString()}&adults=${guest.adults}&children=${guest.children}&infants=${guest.infants}`);
  };

  const handleCheckInChange = (date?: Date) => {
    setCheckIn(date);

    setErrors((prev) => {
      const { checkIn: inDate, ...rest } = prev;
      let newErrors : errorType = { ...rest };

      if (!date) {
        newErrors.checkIn = "Please select a check-in date.";
      }

      return newErrors;
    });
  };

  const handleCheckOutChange = (date?: Date) => {
    setCheckOut(date);

    setErrors((prev) => {
      const { checkOut, ...rest } = prev;
      let newErrors : errorType = { ...rest };

      if (!date) {
        newErrors.checkOut = "Please select a check-out date.";
      } else if (checkIn && date <= checkIn) {
        newErrors.checkOut = "Check-out date must be after check-in date.";
      }

      return newErrors;
    });
  };

  const getFeaturedHotels = async () => {
    try {
      const { data, error } = await supabase
        .from("hotels")
        .select(
          `*,
          hotel_images(*),
          hotel_amenities(amenity_id(*))`
        )
        .eq("featured", true)

      if (error) {
        throw error;
      }

      if (data) {
        setFeaturedHotels(data as any[]);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    }
  };

  const firstLoad=async()=>{
    setLoading(true)
    await getFeaturedHotels();
    setLoading(false)
  }

  // useEffect(()=>{
  //   firstLoad();
  // },[]);

    useEffect(() => {
      firstLoad();
      setBookingData({})
      const subscription = supabase
        .channel("public:hotels")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "hotels",
          },
          async (payload) => {
            const hotelId = payload.new.id;

            try {
              const { data, error } = await supabase
                .from("hotels")
                .select(`
                  *,
                  hotel_images(*),
                  hotel_amenities(amenity_id(*))
                `)
                .eq("id", hotelId);

              if (error) throw error;
              const hotelData = data?.[0];

              if (!hotelData) return;

              setFeaturedHotels((prev) => {
                if (hotelData.featured) {
                  // add or update
                  const exists = prev.find((h) => h.id === hotelData.id);
                  if (exists) {
                    return prev.map((h) =>
                      h.id === hotelData.id ? hotelData : h
                    );
                  } else {
                    return [...prev, hotelData];
                  }
                } else {
                  // remove if featured is false
                  return prev.filter((h) => h.id !== hotelData.id);
                }
              });
            } catch (err: any) {
              console.error("Failed to update featured hotel realtime:", err);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }, []);

    useEffect(() => {
      const fetchDestinations = async () => {
        const { data, error } = await supabase
          .from("hotels")
          .select("destination")
          .neq("destination", null);

        if (!error && data) {
          const uniqueDestinations = Array.from(
            new Set(data.map((d: any) => d.destination))
          );
          setAllDestinations(uniqueDestinations);
          setFilteredDestinations(uniqueDestinations);
        }
      };

      fetchDestinations();
    }, []);

    useEffect(() => {
      if (destination.trim() === "") {
        setFilteredDestinations(allDestinations);
        return;
      }

      const term = destination.toLowerCase();
      setFilteredDestinations(
        allDestinations.filter((d) => d.toLowerCase().includes(term))
      );
    }, [destination, allDestinations]);

    const cities = [
      // { country: "UAE", city: "Dubai", CountryCode: "", cityCode: "", image: "https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171" },
      { 
        country: "India", 
        city: "Mumbai", 
        CountryCode: "84471c4a-031c-4334-a258-173fd8628fa2", 
        cityCode: "3917057e-9e3a-464c-9d50-251ee3fdc547", 
        image: "https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171"
       },
      { 
        country: "Delhi", 
        CountryCode: "", 
        cityCode: "d9f92b35-0857-42ef-9ba0-5c125248d3bc", 
        image: "https://images.unsplash.com/photo-1496939376851-89342e90adcd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" 
      },
      { 
        country: "Malaysia", 
        CountryCode: "e440790d-431a-43c0-9bab-6bbd584b141c", 
        cityCode: "", 
        image: "https://images.unsplash.com/photo-1722336760227-4a661e2db55a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFsYXNpeWF8ZW58MHwwfDB8fHww&auto=format&fit=crop&q=60&w=600" 
      },
      { 
        country: "Thailand", 
        CountryCode: "387b8ce8-fb16-4ce1-83c4-8c380ab81dbd", 
        cityCode: "", 
        city: "Bangkok", 
        image: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" 
      },
    ];

    // const destinations = [
    //   { country: "UAE", city: "Dubai", image: "https://source.unsplash.com/600x400/?mumbai" },
    //   { country: "India", city: "Delhi", image: "https://source.unsplash.com/600x400/?delhi" },
    //   { country: "Japan", city: "Tokyo", image: "https://source.unsplash.com/600x400/?tokyo" },
    //   { country: "Thailand", city: "Bangkok", image: "https://source.unsplash.com/600x400/?bangkok" },
    // ];


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
        <Card className="relative -mt-20 md:-mt-40 mx-4 bg-white shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 gap-y-3 items-center">
                {/* Destination */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Where are you going?"
                      value={destination}
                      onFocus={() => setShowSuggestions(true)}
                      className="border border-gray-200"
                      onChange={(e) => {
                        const value = e.target.value
                        setDestination(value);
                        setShowSuggestions(true);

                        setErrors((prev) => {
                          const { destination, ...rest } = prev;
                          return value.trim() ? rest : { ...rest, destination: "Destination is required." };
                        });
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      required
                    />
                    {destination && (
                      <button
                        type="button"
                        onClick={() => {setDestination(""); setShowSuggestions(true)}}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
                      >
                        <X className="h-4 w-4 text-black" />
                      </button>
                    )}
                  </div>
                  {showSuggestions && (
                    <ul className="absolute z-10 w-[50%] bg-white border border-gray-200 mt-1 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((d, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => { // prevent blur before click
                              setDestination(d);
                              setShowSuggestions(false);

                              setErrors((prev) => {
                                const { destination, ...rest } = prev;
                                return d.trim() ? rest : { ...rest, destination: "Destination is required." };
                              });
                            }}
                          >
                            {d}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500 cursor-default">
                          No destination found
                        </li>
                      )}
                    </ul>
                  )}
                  {errors.destination && (
                    <p className="text-xs text-red-500">{errors.destination}</p>
                  )}
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Check-in
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? checkIn.toLocaleDateString("en-GB") : <span>Select Check-in Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={handleCheckInChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // reset time → 00:00:00

                          return date < today || date < new Date("1900-01-01");
                        }}
                        initialFocus
                        className="w-[85%] m-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.checkIn && (
                    <p className="text-xs text-red-500">{errors.checkIn}</p>
                  )}
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Check-out
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? checkOut.toLocaleDateString("en-GB") : <span>Select Check-out Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={handleCheckOutChange}
                        disabled={(date) => date < new Date() || (checkIn !== undefined && date <= checkIn)}
                        initialFocus
                        className="w-[85%] m-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.checkOut && (
                    <p className="text-xs text-red-500">{errors.checkOut}</p>
                  )}
                </div>

                {/* Guests */}
                <div className="space-y-2 relative">
                  <label className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    Guests
                  </label>
                  <Popover>
                    <PopoverTrigger asChild className="w-full">
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
                    <PopoverContent className="p-4" style={{ width: 'var(--radix-popover-trigger-width)' }}> { /*instead of fixed w-64 it should be full width of its parent, btw w-full is not working here */}
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
          <Link href="/hotels" scroll={true}>
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
              <Card 
                  key={hotel.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={()=>{
                    router.push(`/hotels/${hotel?.id}`)
                  }}>
                <div className="aspect-video relative">
                  <Image 
                    fill
                    src={`${hotel.hotel_images?.find((img: any) => img.is_primary)?.image_url || hotel.hotel_images?.[0]?.image_url}`}
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

      <section>
         <div className="grid sm:grid-cols-2 lg:grid-cols-2 3xl:grid-cols-3 gap-6 p-6">
          {cities.map((c, i) => (
            <CityCard key={i} country={""}  city={c.cityCode || ""} image={c.image} cityName={c.city || ""} countryName={c.country}  />
          ))}
        </div>
      </section>

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